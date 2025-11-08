import mongoose from 'mongoose';
import { createUserModel } from '../schemas/user.schema.js';

export const getAllUsers = async (req, res) => {
    const User = createUserModel(req.app.locals.userDB);
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
    const User = createUserModel(req.app.locals.userDB);
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
    const User = createUserModel(req.app.locals.userDB);
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
    const User = createUserModel(req.app.locals.userDB);
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
    const User = createUserModel(req.app.locals.userDB);
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
    const User = createUserModel(req.app.locals.userDB);
    try {
        if (!req.body.image) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { image: req.body.image },
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
