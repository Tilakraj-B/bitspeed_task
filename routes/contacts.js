const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/contacts', async (req, res) => {
    try {
        const [contacts] = await db.query('SELECT * FROM Contact');
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/createTable', async (req, res) => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Contact (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255),
                phoneNumber VARCHAR(20),
                linkedId INT,
                linkPrecedence ENUM("primary", "secondary") DEFAULT "primary",
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (linkedId) REFERENCES Contact(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `;
        await db.query(createTableQuery);
        res.json({ message: 'Table created successfully' });
    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;