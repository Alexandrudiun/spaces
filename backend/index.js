import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import router from './routes/router.js';
import { initDB } from './db/initDB.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB connections
const { desksConnection, usersConnection } = initDB();
app.locals.desksDB = desksConnection;
app.locals.usersDB = usersConnection;

// App routes FIRST - before static files
app.use('/api', router);

// Serve static files from React build AFTER API routes
app.use(express.static(path.join(__dirname, 'public/dist')));

// Handle React routing - return index.html for all non-API routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
