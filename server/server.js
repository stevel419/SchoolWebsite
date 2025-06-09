require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;

const app = express();

try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to MongoDB");
} catch (e) {
    console.log(e);
}

app.listen(port, () => {
    console.log("Server running on port " + port);
})