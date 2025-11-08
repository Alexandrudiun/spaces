import express from 'express';
import { getAllImages } from '../crud/image.crud.js';

const router = express.Router();

// Placeholder function for GET /all
router.get('/all', getAllImages);

export default router;