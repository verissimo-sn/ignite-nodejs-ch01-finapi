const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;
  const id = uuid();

  const newAccount = {
    id,
    cpf,
    name,
    statement: [],
  }

  customers.push(newAccount);

  return res.status(201).json({ status: 201, error: null, data: [] });
});

const port = 3333;

app.listen(port, () => {
  console.log(`server start on port ${port}`);
});