# 📈 Binomo Clone

> A modern, full-featured trading platform built with the MERN stack

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19-blue)](https://reactjs.org/)

**Binomo Clone** is a sophisticated web-based trading platform that replicates the core functionality of Binomo. Built with modern technologies and best practices, it provides a seamless trading simulation experience with real-time charts, secure authentication, and intuitive user interface.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure, stateless authentication system
- **Protected Routes** - Role-based access control
- **Password Encryption** - bcrypt hashing for secure password storage
- **Email Verification** - Account verification via Nodemailer

### 📊 Trading Experience
- **Real-time Charts** - Powered by TradingView integration
- **Live Market Data** - Real-time price feeds and market updates
- **Trading Simulation** - Risk-free practice environment
- **Multiple Assets** - Support for various trading instruments
- **Order Management** - Buy/sell orders with instant execution

### 💼 Account Management
- **User Profiles** - Comprehensive user account management
- **Balance Tracking** - Real-time account balance updates
- **Transaction History** - Detailed trading history and analytics
- **Dashboard Analytics** - Performance metrics and insights

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first, cross-device compatibility
- **Dark/Light Themes** - Customizable interface themes
- **Intuitive Navigation** - Clean, user-friendly interface
- **Real-time Updates** - Live data synchronization

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | UI Framework | 19.x |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool | Latest |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Styling | Latest |
| ![TradingView](https://img.shields.io/badge/TradingView-131722?style=flat&logo=tradingview&logoColor=white) | Charts | @mathieuc/tradingview |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Runtime | 16+ |
| ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white) | Web Framework | Latest |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) / ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white) | Database | Latest |
| ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens) | Authentication | Latest |

## 📁 Project Architecture

```
Binomo_Clone/
├── 📁 backend/                 # Server-side application
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database & app configuration
│   │   ├── 📁 controllers/     # Business logic handlers
│   │   ├── 📁 middleware/      # Custom middleware functions
│   │   ├── 📁 models/          # Database schemas/models
│   │   ├── 📁 routes/          # API route definitions
│   │   └── 📁 utils/           # Helper functions
│   ├── 📁 tests/               # Backend test suites
│   ├── 📄 package.json
│   └── 📄 server.js            # Application entry point
├── 📁 frontend/                # Client-side application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 utils/           # Utility functions
│   │   ├── 📁 assets/          # Images, icons, fonts
│   │   └── 📁 styles/          # Global styles
│   ├── 📁 tests/               # Frontend test suites
│   ├── 📄 package.json
│   └── 📄 vite.config.js       # Vite configuration
├── 📄 README.md
├── 📄 .gitignore
└── 📄 docker-compose.yml       # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- ![Node.js](https://img.shields.io/badge/Node.js-v16+-green) [Download](https://nodejs.org/)
- ![npm](https://img.shields.io/badge/npm-v8+-red) or ![yarn](https://img.shields.io/badge/yarn-v1.22+-blue)
- ![MongoDB](https://img.shields.io/badge/MongoDB-v5+-green) or ![MySQL](https://img.shields.io/badge/MySQL-v8+-blue)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/binomo-clone.git
   cd binomo-clone
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database (Choose one)
   MONGODB_URI=mongodb://localhost:27017/binomo_clone
   # OR for MySQL
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=binomo_clone
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # API Keys
   TRADINGVIEW_API_KEY=your-tradingview-api-key
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Development Server

Start both servers concurrently:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

🌐 **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 📜 Available Scripts

### Backend
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run test suites
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🐳 Docker Support

Run the entire application with Docker:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down
```

## 🧪 Testing

We use comprehensive testing strategies:

```bash
# Run all tests
npm run test

# Frontend tests (Vitest + React Testing Library)
cd frontend && npm run test

# Backend tests (Jest + Supertest)
cd backend && npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## 📚 API Documentation

The API is documented using OpenAPI/Swagger. Visit http://localhost:5000/api-docs when running the development server.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/user/profile` | Get user profile |
| POST | `/api/trades/create` | Create new trade |
| GET | `/api/trades/history` | Get trading history |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Express.js](https://expressjs.com/) - Web Framework
- [TradingView](https://www.tradingview.com/) - Charting Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Vite](https://vitejs.dev/) - Build Tool

## 📞 Support

- 📧 Email: support@binomoclone.com
- 💬 Discord: [Join our community](https://discord.gg/binomoclone)
- 📖 Documentation: [docs.binomoclone.com](https://docs.binomoclone.com)

## 🔗 Links

- [Live Demo](https://binomoclone.netlify.app)
- [API Documentation](https://api.binomoclone.com/docs)
- [Project Board](https://github.com/yourusername/binomo-clone/projects)

---

**⭐ Star this repo if you found it helpful!**