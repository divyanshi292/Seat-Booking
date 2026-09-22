# Cineflix (Seat Booking App)

A full-stack seat booking application with a cinematic Netflix-inspired UI, JWT authentication, and a dynamic 5-minute seat-holding checkout system. Built with React (Vite), Node.js, Express, and MySQL (Sequelize).

## Tech Stack
* **Frontend**: React (Vite), Tailwind CSS, React Router, React Hot Toast
* **Backend**: Node.js, Express, Sequelize (ORM), bcryptjs, jsonwebtoken
* **Database**: MySQL

## Prerequisites
* Node.js installed
* MySQL server running (e.g., via WAMP/XAMPP)

## Setup Instructions

### 1. Database Configuration
1. Open your MySQL client (or phpMyAdmin) and create a database named `seat_booking`.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=root
   DB_NAME=seat_booking
   JWT_SECRET=super_secret_key
   ```
4. Seed the database with movies and seats (Run this once):
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder and add the following:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Features
* **Authentication**: Secure JWT-based Login/Register flow.
* **Dynamic Grid**: View movies and interactive seat maps.
* **Concurrency Control**: 5-minute checkout timer that actively "holds" seats in the database to prevent double bookings.
* **Past Bookings**: View your purchase history in the "My Tickets" tab.
