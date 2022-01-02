const express = require('express');

const app = express();

app.get('/', (req, res) => {
  return res.json({ message: 'Hello' })
})

const port = 3333;

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});