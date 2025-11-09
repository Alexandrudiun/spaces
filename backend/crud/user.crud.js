import mongoose from 'mongoose';
import { createUserModel } from '../schemas/user.schema.js';
import { createDeskModel } from '../schemas/desk.schema.js';

export const getAllUsers = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

export const createUser = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

export const updateUserImage = async (req, res) => {
    const User = createUserModel(req.app.locals.usersDB);
    try {
        if (!req.params.image) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { image: req.params.image },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User image updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user image',
            error: error.message
        });
    }
};

export const getDesksWhereUserIsAttendee = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desks = await Desk.find({
            'bookings.attendees': req.user.userId
        });

        const bookings = desks.map((desk) => desk.bookings);

        res.status(200).json({ 
            status: 200, 
            message: 'Desks retrieved successfully', 
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({ 
            status: 500, 
            message: 'Error retrieving desks', 
            error: error.message 
        });
    }
};

/*
POST with (any) userId as param + timestamp
response -> desks where id is present in desk.bookings.attendees && desk is accepted with valid timestamp
*/
export const getAllPositionsOfUser = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    const User = createUserModel(req.app.locals.usersDB);

    const { userId, timestamp } = req.body;
    const queryTime = new Date(timestamp);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'User not found' 
            });
        }

        const desks = await Desk.find({
            'bookings.attendees': userId, 
            'bookings.status': 'accepted',
        });

        const validDesks = desks.map(desk => {
            // Create a copy of the desk as a plain object
            const deskObj = desk.toObject();
            
            // Filter bookings to only keep valid ones
            deskObj.bookings = deskObj.bookings.filter(booking => 
                booking.status === 'accepted' &&
                booking.start <= queryTime && 
                booking.end >= queryTime &&
                booking.attendees.some(attendeeId => attendeeId.toString() === userId)
            );

            return deskObj;
        }).filter(desk => desk.bookings.length > 0); // Only keep desks that have valid bookings

        res.status(200).json({ 
            status: 200, 
            message: 'Found valid locations for user at given time', 
            data: validDesks,
        });
    } catch (error) {
        res.status(500).json({ 
            status: 500, 
            message: 'Error retrieving desks', 
            error: error.message 
        });
    }
};