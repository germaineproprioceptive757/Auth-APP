import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
// Middleware to parse JSON bodies
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Auth App API');
});

// Authentication routes
app.use('/api/auth', authRoutes);
// User routes
app.use('/api/user', userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});