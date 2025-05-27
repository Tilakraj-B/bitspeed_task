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

router.post('/identify', async (req, res) => {
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Email or phone is required' });
    }

    try {
        const [existingContacts] = await db.query('SELECT * FROM Contact WHERE email = ? OR phoneNumber = ?', [email, phoneNumber]);
        
        // If no existing contact found, create new
        if(existingContacts.length === 0){

            const [result] = await db.query('INSERT INTO Contact (email, phoneNumber) VALUES (?, ?)', [email, phoneNumber]);
            const newContactId = result;
            return res.status(200).json({
                "contact":{
                    "primaryContactId": newContactId.insertId,
                    "email": [email],
                    "phoneNumber": [phoneNumber],    
                    "SecondaryContactId": [],
                }
             });
        }
        let primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];

        for (let contact of existingContacts) {
        if (contact.id !== primaryContact.id && contact.linkPrecedence === 'primary') {
            await db.query(`
            UPDATE Contact SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = NOW()
            WHERE id = ?
            `, [primaryContact.id, contact.id]);
        }
        }

        const emailsSet = new Set(existingContacts.map(c => c.email).filter(Boolean));
        const phonesSet = new Set(existingContacts.map(c => c.phoneNumber).filter(Boolean));

        const isNewEmail = email && !emailsSet.has(email);
        const isNewPhone = phoneNumber && !phonesSet.has(phoneNumber);

        if (isNewEmail || isNewPhone) {
            await db.query(`
                INSERT INTO Contact (email, phoneNumber, linkPrecedence, linkedId, createdAt, updatedAt)
                VALUES (?, ?, 'secondary', ?, NOW(), NOW())
            `, [email, phoneNumber, primaryContact.id]);
        }

        const [allLinkedContacts] = await db.query(`
            SELECT * FROM Contact 
            WHERE id = ? OR linkedId = ?`, 
            [primaryContact.id, primaryContact.id]);

        const uniqueEmails = [...new Set(allLinkedContacts.map(c => c.email).filter(Boolean))];
        const uniquePhoneNumbers = [...new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean))];
        const secondaryIds = allLinkedContacts
        .filter(c => c.linkPrecedence === 'secondary')
        .map(c => c.id);

        return res.status(200).json({
        contact: {
            primaryContactId: primaryContact.id,
            emails: uniqueEmails,
            phoneNumbers: uniquePhoneNumbers,
            secondaryContactIds: secondaryIds
        }
        });


    } catch (error) {
        console.error('Error identifying contact:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
});

module.exports = router;