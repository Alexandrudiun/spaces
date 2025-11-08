import express from 'express';
import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import deskRouter from './desk.route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/login', userRouter);
router.use('/desk', deskRouter);

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

export default router;

