import express from 'express'
import { getUserProfile, getUsers, reactToUser, updateBasicProfileAndLocation, updateUserSettings } from '../controllers/user.controller.js'
import { verifyToken } from '../middlewear/verifyToken.js';
import upload from '../utils/multer.js';
import { updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/userReaction', verifyToken, reactToUser);
router.post('/basicUserInfo', verifyToken, upload.array('profilePics', 6), 
    updateBasicProfileAndLocation);
router.patch("/update-profile", upload.array("profilePics", 6), verifyToken, updateProfile);
router.get('/profile', verifyToken, getUserProfile);
router.patch('/settings', verifyToken, updateUserSettings);


export default router