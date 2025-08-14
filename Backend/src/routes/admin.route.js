import express from 'express';
import {
    getAdminDashboardStats,
    getAdminUserList,
    getAdminReports,
    updateReportStatus,
    suspendUser
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewear/verifyToken.js';
const router = express.Router();

// Admin routes with authentication middleware
router.get('/stats', verifyToken, getAdminDashboardStats);
router.get('/users', verifyToken, getAdminUserList);
router.get('/reports', verifyToken, getAdminReports);
router.patch('/reports/status', verifyToken, updateReportStatus);
router.patch('/users/suspend', verifyToken, suspendUser);

export default router;