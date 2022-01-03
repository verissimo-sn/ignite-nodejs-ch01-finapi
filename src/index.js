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

app.get('/statement', verifyIfExistsAccount, (req, res) => {
  const { customer } = req;

  return res.status(200).json({
    status: 200,
    error: null,
    data: {statement: customer.statement}
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

const port = 3333;

app.listen(port, () => {
  console.log(`server start on port ${port}`);
});