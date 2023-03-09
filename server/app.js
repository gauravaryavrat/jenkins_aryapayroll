const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = 3001;
const app = express();
app.listen(port , function() {
  console.log('Arya Payroll is running');
});
