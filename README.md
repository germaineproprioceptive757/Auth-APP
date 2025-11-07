# Auth APP

A full-stack authentication application with React/Vite frontend and Node.js/Express backend.

## Features

- User registration with email verification
- Login/logout functionality
- Password reset functionality
- JWT-based authentication
- Protected routes
- Email templates for verification and password reset

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express
- MongoDB (with Mongoose)
- Nodemailer for email services
- JWT for authentication

## Project Structure

```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── ...
└── server/          # Backend Node.js API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/auth-app.git
   cd auth-app
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

#### Server
Create a `.env` file in the `server/` directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:3000
```

#### Client
Create a `.env` file in the `client/` directory with the following variables:
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd ../client
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User Routes
- `GET /api/users/me` - Get current user (protected)

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to contribute to this project.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our community.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Siddhartha - [@your_twitter](https://twitter.com/your_twitter) - your_email@example.com

Project Link: [https://github.com/your-username/auth-app](https://github.com/your-usern/auth-app)