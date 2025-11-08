import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const initDB = () => {
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
  return { desksConnection, usersConnection };
}

