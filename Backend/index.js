import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import authRoutes from './src/routes/auth.route.js'
import userRoutes from './src/routes/user.route.js'
import { connectDB } from './src/DB/connectDB.js';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());

// Configure CORS to allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",  // Frontend app
  "http://localhost:3001"   // Admin app
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// For JSON data parsing - MUST come before routes
app.use(express.json());

// For x-www-form-urlencoded data parsing - MUST come before routes
app.use(express.urlencoded({ extended: true }));

// Serve the "uploads" folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Now register your routes
app.use('/api/auth', authRoutes);  // Prefix all auth routes with /api/auth
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log(`server is listening on port ${PORT}`);
  connectDB();
});