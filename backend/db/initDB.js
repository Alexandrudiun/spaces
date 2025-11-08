import mongoose from 'mongoose';

export const initDB = () => {
    const desksConnection = mongoose.createConnection(process.env.MONGO_molson_desks);
    const usersConnection = mongoose.createConnection(process.env.MONGO_molson_user);

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

    return { desksConnection, usersConnection };
};

