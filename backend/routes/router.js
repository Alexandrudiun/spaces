import express from 'express';
import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import deskRouter from './desk.route.js';
import imageRouter from './image.route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/desk', deskRouter);
router.use('/image', imageRouter);

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

export default router;

