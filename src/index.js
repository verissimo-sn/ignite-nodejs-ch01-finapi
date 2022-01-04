const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

const verifyIfExistsAccount = (req, res, next) => {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return res.status(400).json({
      status: 400,
      error: 'Customer not found !',
      data: []
    });
  }

  req.customer = customer;

  return next();
}

const getBalance = (statement) => {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;
  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return res.status(400).json({
      status: 400,
      error: 'Customer Already Exists!',
      data: []
    });
  }

  const id = uuid();

  const newAccount = {
    id,
    cpf,
    name,
    statement: [],
  }

  customers.push(newAccount);

  return res.status(201).json({
    status: 201,
    error: null,
    data: [{ id }]
  });
});

app.put('/account/', verifyIfExistsAccount, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).json({
    status: 201,
    error: null,
    data: {
      customerId: customer.id
    }
  });
});

app.get('/account/', verifyIfExistsAccount, (req, res) => {
  const { customer } = req;

  return res.status(201).json({
    status: 201,
    error: null,
    data: {
      ...customer
    }
  });
});

app.delete('/account/', verifyIfExistsAccount, (req, res) => {
  const { customer } = req;

  customers.splice(customer[customer.id], 1);

  return res.status(201).json({
    status: 201,
    error: null,
    data: customers
  });
});

app.get('/statement', verifyIfExistsAccount, (req, res) => {
  const { customer } = req;

  return res.status(200).json({
    status: 200,
    error: null,
    data: {statement: customer.statement}
  });
});

app.get('/statement/date', verifyIfExistsAccount, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + ' 00:00');

  const statement = customer.statement
    .filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

  if(!statement[0]) {
    return res.status(400).json({
      status: 400,
      error: 'Statement not found',
      data: {
        customerId: customer.id,
        statement: []
      }
    });
  }

  return res.status(200).json({
    status: 200,
    error: null,
    data: {
      customerId: customer.id,
      statement: statement
    }
  });
});

app.post('/deposit', verifyIfExistsAccount, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    type: 'credit',
    created_at: new Date(),
  }

  customer.statement.push(statementOperation);

  return res.status(201).json({
    status: 201,
    error: null,
    data: {
      customerId: customer.id,
      statement: {
        ...statementOperation,
      }
    }
  });
});

app.post('/withdraw', verifyIfExistsAccount, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({
      status: 400,
      error: 'Insufficient funds!',
      data: {
        customerId: customer.id,
      }
    });
  }

  const statementOperation = {
    description,
    amount,
    type: 'debit',
    created_at: new Date(),
  }

  customer.statement.push(statementOperation);

  return res.status(201).json({
    status: 201,
    error: null,
    data: {
      customerId: customer.id,
      statement: {
        ...statementOperation,
      },
    }
  });
});



const port = 3333;

app.listen(port, () => {
  console.log(`server start on port ${port}`);
});