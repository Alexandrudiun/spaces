import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connections
const desksConnection = mongoose.createConnection(process.env.MONGO_molson_desks);
const usersConnection = mongoose.createConnection(process.env.MONGO_molson_user);

// Connection event listeners
desksConnection.on('connected', () => {
    console.log('MongoDB connected successfully to molson_desks');
});

desksConnection.on('error', (err) => {
    console.error('MongoDB molson_desks connection error:', err);
});

usersConnection.on('connected', () => {
    console.log('MongoDB connected successfully to molson_users');
});

usersConnection.on('error', (err) => {
    console.error('MongoDB molson_users connection error:', err);
});

// Export connections for use in models
app.locals.desksDB = desksConnection;
app.locals.usersDB = usersConnection;

// API Routes (add your API routes here before the static files)
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing - return index.html for all non-API routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});