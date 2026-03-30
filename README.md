# E-Commerce Platform

A full-stack e-commerce application with role-based access for buyers, vendors, and admins.

This project includes:
- A Node.js + Express + MongoDB backend API
- A React + Vite frontend client
- Automated testing with Jest, Supertest, and Cypress

## Project Highlights

- Authentication with JWT and role-based authorization
- Product and category management
- Cart and checkout flow
- Order management for users, vendors, and admins
- Vendor approval and admin management features
- Backend API tests with in-memory MongoDB
- End-to-end purchase flow test with Cypress

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Jest + Supertest

### Frontend
- React
- Vite
- Axios
- React Router
- Cypress

## Repository Structure

```text
e-commerce-project/
├── Backend/                  # Express API + backend tests
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   ├── Routes/
│   ├── config/
│   ├── tests/
│   ├── app.js
│   └── server.js
├── frontend/                 # React app + Cypress E2E tests
│   ├── src/
│   ├── cypress/
│   └── cypress.config.js
├── CYPRESS_TEST_ANALYSIS.md
└── README.md
```

## Getting Started

### 1) Prerequisites

Install:
- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local instance or MongoDB Atlas)

### 2) Clone and Install Dependencies

From the project root:

```bash
# Backend dependencies
cd Backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3) Configure Environment Variables

Create a file named `.env` inside `Backend/`:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Auth
JWT_SECRET=replace_with_a_strong_secret

# Email (optional for local development)
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Set false to disable actual email sending
USE_EMAIL=false
```

Notes:
- The backend accepts either `MONGODB_URI` or `MONGO_URI`.
- If neither database variable is set, the backend will fail at startup.

### 4) Run the Application

Open two terminals.

Terminal 1 (Backend):

```bash
cd Backend
npm run dev
```

Backend runs on: `http://localhost:5000`

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Available Scripts

### Backend (`Backend/package.json`)

```bash
npm start      # Run production server
npm run dev    # Run server with nodemon
npm test       # Run Jest tests
```

### Frontend (`frontend/package.json`)

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run cypress:open # Open Cypress UI
npm run cypress:run  # Run Cypress headless
```

## Testing

### Backend Tests (Jest + Supertest)

Run from `Backend/`:

```bash
npm test
```

What is covered:
- Auth module
- User module
- Product module
- Category module
- Cart module
- Order helper logic

Important detail:
- Backend tests use `mongodb-memory-server` in `Backend/tests/setup.js`, so they run against an in-memory database.

### Frontend E2E Tests (Cypress)

Run from `frontend/`:

```bash
npm run cypress:open
# or
npm run cypress:run
```

Current E2E purchase flow test expects:
- Frontend at `http://localhost:5173`
- Backend at `http://localhost:5000`
- A test user account (for login)
- A valid product in the database referenced by the Cypress test

For details, see `CYPRESS_TEST_ANALYSIS.md`.

## API Route Groups

Main backend route prefixes:
- `/api/auth`
- `/api/users` and admin/vendor routes under `/api`
- `/api/product`
- `/api/cart`
- `/api/orders`
- `/categories`

## Development Notes

- Frontend API base URL is currently hardcoded to `http://localhost:5000` in `frontend/src/services/api.js`.
- Cypress configuration uses `frontend/cypress.config.js` with `baseUrl` pointing to the frontend and `env.apiUrl` pointing to the backend.

