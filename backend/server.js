const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const {sendEmail} = require("./email");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
