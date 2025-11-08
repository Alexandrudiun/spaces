import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';


const router = express.Router();


router.get("/", authenticate, (req, res) => {
    return res.status(200).json({ 
        success: true,
        message: "Desks route is working",
        user: req.user
    });
});

// Example: Only managers and admins can create desks
router.post("/", authenticate, authorize('manager', 'admin'), (req, res) => {
    return res.status(200).json({ 
        success: true,
        message: "Create desk endpoint (manager/admin only)" 
    });
});

export default router;

