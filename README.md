# Binomo Clone

A full-stack web application that clones the functionality of Binomo, a popular trading platform. This project is built using the MERN stack (MongoDB/MySQL, Express, React, Node.js).

## Project Overview

This Binomo Clone is a web-based trading platform that allows users to practice trading in a simulated environment. The application includes features for user authentication, trading simulation, and account management.

## Features

- **User Authentication**: Secure login and registration system with JWT
- **Trading Interface**: Interactive charts and trading tools using TradingView integration
- **Account Management**: User profile and account balance management
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Vite (for fast development and building)
- TradingView integration (@mathieuc/tradingview)

### Backend
- Node.js with Express
- MongoDB/MySQL for database
- JWT for authentication
- Nodemailer for email functionality

## Project Structure

```
├── backend/             # Backend server code
│   ├── src/             # Source files
│   │   ├── config/      # Configuration files (DB, etc.)
│   │   ├── controllers/ # Request handlers
│   │   └── middleware/  # Express middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
└── frontend/            # Frontend React application
    ├── public/          # Static files
    └── src/             # Source files
        ├── assets/      # Images, fonts, etc.
        ├── components/  # React components
        └── ...          # Other React app files
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB or MySQL database

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Binomo_Clone
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   # or for MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=binomo_clone
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to see the application

## Development

- Backend server runs on port 5000 by default
- Frontend development server runs on port 5173 (Vite default)

## License

This project is licensed under the ISC License

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [TradingView](https://www.tradingview.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)