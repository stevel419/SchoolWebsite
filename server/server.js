require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use('/api', routes);

app.listen(port, () => {
    console.log("Server running on port " + port);
});