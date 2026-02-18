# EduDash - Education Dashboard

A full-stack education dashboard application built with Next.js (frontend) and Express.js (backend).

## Project Structure

```
edudash/
│
├── frontend/              (Next.js app)
│   ├── app/              (Next.js app directory with pages and layouts)
│   ├── components/       (React components)
│   ├── hooks/            (Custom React hooks)
│   ├── lib/              (Utilities and helpers)
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── package-lock.json
│
├── backend/              (Express.js API)
│   ├── src/
│   │   ├── config/       (Database connection, environment config)
│   │   ├── models/       (MongoDB schemas)
│   │   ├── routes/       (API endpoints)
│   │   ├── controllers/  (Business logic)
│   │   ├── middleware/   (Authentication, RBAC, validation)
│   │   ├── utils/        (Helper functions)
│   │   └── server.js     (Express server entry point)
│   │
│   ├── .env              (Environment variables template)
│   └── package.json
│
├── package.json          (Monorepo root)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for local development)

### Installation

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

This will install:
1. Root dependencies (concurrently for running multiple processes)
2. Frontend dependencies
3. Backend dependencies

### Development

#### Run both frontend and backend concurrently:

```bash
npm run dev
```

#### Run frontend only:

```bash
npm run dev:frontend
```

Frontend will be available at `http://localhost:3000`

#### Run backend only:

```bash
npm run dev:backend
```

Backend will be available at `http://localhost:5000`

### Building

Build the frontend for production:

```bash
npm run build
```

### Deployment

The frontend and backend can be deployed separately:

- **Frontend**: Deploy to Vercel, Netlify, or any static hosting
- **Backend**: Deploy to Heroku, Railway, AWS, or any Node.js hosting

## API Documentation

The backend API is available at `http://localhost:5000/api`

### Available Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/dashboard/:role` - Get role-specific dashboard data
- `GET /api/health` - Health check

## Environment Variables

### Backend (.env)

Create a `.env` file in the backend folder:

```
MONGODB_URI=mongodb://localhost:27017/edudash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend

Configure any API endpoints in the frontend environment files or constants.

## Features

- 🎓 Role-based dashboards (Admin, Teacher, Student)
- 🔐 Authentication and authorization
- 📊 Dashboard with analytics
- 👥 User management
- 🎨 Beautiful UI with Tailwind CSS and Shadcn components

## Technology Stack

**Frontend:**
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Hook Form

**Backend:**
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- CORS enabled

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
