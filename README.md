# FoodieHub 🍔

A full-stack food ordering website built with React, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend:** React + Vite, React Router, Axios, React Icons
- **Backend:** Node.js, Express.js, REST API
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt, Role-based (Customer / Admin)
- **Payment:** Cash on Delivery + Stripe (online)

## Project Structure

```
FoodieHub/
├── frontend/        # React + Vite app
└── backend/         # Node.js + Express API
```

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd FoodieHub
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — add your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

### 4. Seed sample data (optional)

```bash
cd backend
node utils/seedData.js
```

This creates sample categories, food items, and an admin account:
- Email: `admin@foodiehub.com`
- Password: `admin123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/foods | Get all foods |
| GET | /api/categories | Get all categories |
| POST | /api/orders | Place order |
| GET | /api/orders/my-orders | Customer orders |
| GET | /api/admin/stats | Admin dashboard stats |

## Deployment

- **Frontend:** Deploy `/frontend` to Vercel
- **Backend:** Deploy `/backend` to Render
- **Database:** MongoDB Atlas

Set environment variables on your hosting platforms matching `.env.example` files.

## Features

- Browse food menu with search + category filter
- Shopping cart with localStorage persistence
- Customer registration and login (JWT)
- Place orders (Cash on Delivery or Stripe)
- Order tracking with status updates
- Admin dashboard — manage foods, categories, orders, customers
