import express from 'express'
import { verifyToken } from '../middlewear/verifyToken.js';
import { getMatches, getMatchesWithChats } from '../controllers/chat.controller.js';

const router = express.Router();
router.get('/matches', verifyToken, getMatches);
router.get('/matchesChat', verifyToken, getMatchesWithChats)

export default router;