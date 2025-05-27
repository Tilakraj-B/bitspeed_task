require('dotenv').config();
const express = require('express');
const contacts = require('./routes/contacts');

const app = express();
app.use(express.json());
app.use('/', contacts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});