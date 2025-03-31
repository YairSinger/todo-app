# Todo App Backend

A REST API backend for a Todo application with Point of Contact (POC) management and email verification.

## Features

- Todo management (create, read, update, delete)
- Contact management with email verification
- PostgreSQL database with Sequelize ORM
- Express.js REST API

## Project Structure

```
todo-backend/
├── config/                  # Configuration files
│   ├── database.js          # Database configuration
│   ├── email.js             # Email service configuration
│   └── index.js             # Export all configurations
│
├── models/                  # Database models
│   ├── index.js             # Exports and associates all models
│   ├── Poc.js               # Point of Contact model
│   ├── PendingPoc.js        # Pending verification model
│   └── Todo.js              # Todo model
│
├── controllers/             # Request handlers
│   ├── pocController.js     # POC-related controllers
│   └── todoController.js    # Todo-related controllers
│
├── routes/                  # Express routes
│   ├── index.js             # Combines all routes
│   ├── pocRoutes.js         # POC-related routes
│   └── todoRoutes.js        # Todo-related routes
│
├── services/                # Business logic
│   ├── emailService.js      # Email sending functionality
│   └── verificationService.js # Verification code generation/validation
│
├── middleware/              # Express middleware
│   └── errorHandler.js      # Global error handling
│
├── utils/                   # Utility functions
│   └── helpers.js           # Helper functions
│
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment variables
├── package.json             # Project dependencies
├── server.js                # Application entry point
└── README.md                # Project documentation
```

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL

## Getting Started

1. Clone the repository
2. Create a PostgreSQL database named `todoapp`
3. Copy `.env.example` to `.env` and update with your configuration
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the server:

   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Todos

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
  - Required fields: `text`, `pocEmail`
  - Optional fields: `dueDate`
- `PUT /api/todos/:id` - Update a todo
  - Optional fields: `text`, `dueDate`, `completed`, `pocEmail`
- `DELETE /api/todos/:id` - Delete a todo

### Point of Contacts (POCs)

- `GET /api/pocs` - Get all POCs
- `POST /api/pocs` - Create a new POC directly (bypassing verification)
  - Required fields: `name`, `email`
- `PUT /api/pocs/:id` - Update a POC
  - Required fields: `name`, `email`
- `DELETE /api/pocs/:id` - Delete a POC

### POC Email Verification

- `POST /api/pocs/verify` - Send verification email
  - Required fields: `name`, `email`
- `POST /api/pocs/confirm` - Confirm verification and create POC
  - Required fields: `email`, `code`

## Environment Variables

See `.env.example` for required environment variables.

## Email Verification

The system uses EmailJS for sending verification emails. You need to set up an EmailJS account and create a template with the following parameters:

- `email` - Recipient email
- `expiration_time` - When the verification code expires
- `passcode` - The verification code

## Running in Development

For development with automatic restart:

```bash
npm install -g nodemon
nodemon server.js
```

## Code Formatting

This project uses ESM modules for cleaner imports and modern JavaScript features.