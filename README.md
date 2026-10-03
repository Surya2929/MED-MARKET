# MedMarket

MedMarket is a full-stack medicine marketplace web app. Users can search for medicines, add them to a cart, pay online, and track their orders. Vendors can manage their medicines and stock. Admins can manage users and the whole platform.

**Live demo:** https://med-market-two.vercel.app

## Features

- Sign up and login with email and password (JWT based)
- Google login
- Search medicines and view medicine details
- Cart and order placement
- Online payment with Razorpay
- Wallet to manage payments and refunds
- Return requests for orders
- Complaint chat and reports
- AI chatbot (uses Groq)
- Save and select delivery addresses
- Separate dashboards for vendors and admins
- Multi-language support in the frontend

## Tech Stack

| Part | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt, Google login |
| Payments | Razorpay |
| AI | Groq |
| Deployment | Frontend on Vercel, backend on Render |

## Project Structure

```
MED-MARKET/
  backend/     Express API (controllers, models, routes, middleware)
  frontend/    React app (pages, components, context, services)
  vercel.json
```

## How to Run Locally

You need Node.js and a MongoDB database (local or MongoDB Atlas).

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder. You can copy the names from `.env.example` and add your own values:

```
PORT=5000
MONGO_URI=
JWT_SECRET=
GROQ_API_KEY=
GOOGLE_CLIENT_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

Optional: create the admin user and add some sample medicines:

```bash
node seed.js
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
VITE_RAZORPAY_KEY_ID=
```

Start the app:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Admin Account

After you run `node seed.js`, an admin user is created with the email `admin@medmarket.in`. See `backend/seed.js` for the setup, and change the password after your first login.

## API Overview

The backend has these main route groups:

- `/api/auth` - register and login
- `/api/medicines` - medicines
- `/api/vendor` - vendor actions
- `/api/orders` - orders
- `/api/payments` - Razorpay payments
- `/api/wallet` - wallet
- `/api/addresses` - delivery addresses
- `/api/users` - user profile and management
- `/api/reports` - reports and complaints
- `/api/chat` - AI chatbot

## Note

The backend is on a free Render plan, so the first load may take up to a minute.

## Author

Suryansh Chaudhary
