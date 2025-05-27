# bitespeed_task

A Node.js backend service for Bitespeed's Identity Reconciliation assignment.  
This service consolidates customer contact information based on provided phone numbers and emails, ensuring unique, unified contact records in the database.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MySQL**

---

## Project Structure

```
.
├── config/
│ └── db.js          # Database connection config
├── routes/
│ └── contacts.js    # API routes for contact management
├── .env             # Environment variables (DO NOT commit this!)
├── .gitignore       # Ignores node_modules and .env
├── index.js         # Entry point of the app
└── package.json     # Node.js project config
```

---

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/yourusername/bitespeed-backend.git
cd bitespeed-backend
```

---

### Install Dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env` file in the project root with the following contents:

```env
DB_HOST=0.0.0.0
DB_USER=user
DB_PASSWORD=pass
DB_NAME=name
DB_PORT=3306
DB_DIALECT=mysql
PORT=3000
```

---

### Run the Server

```bash
npm start
```

Or directly via:

```bash
node server.js
```

Server will start on the port defined in `.env` (default: 3000)

---

## API Endpoints

### GET `/contacts`

Fetches all contacts currently in the database.

**Example Response:**

```json
[
  {
    "id": 1,
    "email": "someone@example.com",
    "phoneNumber": "123456",
    "linkedId": null,
    "linkPrecedence": "primary",
    "created_at": "2023-04-01T00:00:00.000Z",
    "updated_at": "2023-04-01T00:00:00.000Z",
    "deleted_at": null
  },
]
```

### GET `/createTable`

Creates the `Contact` table in your MySQL database if it doesn't exist.

**Response:**

```json
{
  "message": "Table created successfully"
}
```

**Table Structure:**

| Column        | Type               | Notes                                       |
|:--------------|:------------------|:--------------------------------------------|
| `id`          | INT, AUTO_INCREMENT | Primary key                                 |
| `email`       | VARCHAR(255)        | Optional contact email                      |
| `phoneNumber` | VARCHAR(20)         | Optional contact phone number               |
| `linkedId`    | INT                 | Foreign key to another Contact's `id`       |
| `linkPrecedence` | ENUM('primary', 'secondary') | Defaults to `primary` |
| `created_at`  | TIMESTAMP           | Created timestamp, defaults to current time |
| `updated_at`  | TIMESTAMP           | Updates on row update                       |
| `deleted_at`  | TIMESTAMP (nullable) | Can be used for soft deletes                 |

**Foreign Key Constraint:**  
`linkedId` references `Contact(id)` with `ON DELETE CASCADE` and `ON UPDATE CASCADE`.

### POST `/identify`

Consolidates contact information by email and phone number. Returns a primary contact and any related secondary contacts.

**Request:**

```json
{
  "email": "someone@example.com",
  "phoneNumber": "123456"
}
```

**Response Example:**

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["someone@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

---

## .gitignore

```
node_modules/
.env
```

Ensures sensitive files like `.env` and dependencies are not pushed to version control.
---

## Render Link

You can access the deployed backend service live on Render here:

[https://your-bitespeed-backend.onrender.com](https://bitspeed-task-teya.onrender.com)
