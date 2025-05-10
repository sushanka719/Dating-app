import express from 'express'
import { verifyEmail, signup, login, logout, checkAuth } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewear/verifyToken.js';

const router = express.Router();

router.get("/verify-email", verifyEmail)
router.post("/signup", signup)
router.post('/login', login)
router.post("/logout", logout);
router.get('/check-auth', verifyToken, checkAuth)

export default router;