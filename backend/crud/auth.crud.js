import jwt from 'jsonwebtoken';
import { createUserModel } from '../schemas/user.schema.js';
import { RegisterRequest } from '../models/registerRequest.model.js';
import { createDeskModel } from '../schemas/desk.schema.js';

const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        console.log('Content-Type:', req.headers['content-type']);
        
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is empty. Please send JSON data with Content-Type: application/json'
            });
        }
        
        const registerRequest = new RegisterRequest(req.body);
        const validation = registerRequest.validate();

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const User = createUserModel(req.app.locals.usersDB);

        // Check if email already exists
        const existingEmail = await User.findOne({ email: registerRequest.email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username: registerRequest.username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        const user = await User.create(registerRequest.getData());

        const token = generateToken(user._id, user.email, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    location: user.location
                }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const User = createUserModel(req.app.locals.usersDB);

        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const User = createUserModel(req.app.locals.usersDB);
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const User = createUserModel(req.app.locals.usersDB);
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
    try {
        const User = createUserModel(req.app.locals.usersDB);
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
    try {
        const User = createUserModel(req.app.locals.usersDB);
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
    try {
        const User = createUserModel(req.app.locals.usersDB);
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
    try {
        const User = createUserModel(req.app.locals.usersDB);
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
    try {
        const User = createUserModel(req.app.locals.usersDB);
        
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

export const getAllDesks = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const desks = await Desk.find().populate('bookings');
        res.status(200).json({ 
            success: true,
            message: 'Desks retrieved successfully', 
            data: desks 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error retrieving desks', 
            error: error.message 
        });
    }
};

export const getDeskById = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const desk = await Desk.findById(req.params.id).populate('bookings');
        if (!desk) {
            return res.status(404).json({ 
                success: false,
                message: 'Desk not found' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Desk retrieved successfully', 
            data: desk 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error retrieving desk', 
            error: error.message 
        });
    }
};

export const updateDesk = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const desk = await Desk.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!desk) {
            return res.status(404).json({ 
                success: false,
                message: 'Desk not found' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Desk updated successfully', 
            data: desk 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating desk', 
            error: error.message 
        });
    }
};

export const deleteDesk = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const desk = await Desk.findByIdAndDelete(req.params.id);
        if (!desk) {
            return res.status(404).json({ 
                success: false,
                message: 'Desk not found' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Desk deleted successfully', 
            data: desk 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting desk', 
            error: error.message 
        });
    }
};

export const handleReservationRequest = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const { bookingId, accept } = req.body;
        
        const desk = await Desk.findById(req.params.id);
        if (!desk) {
            return res.status(404).json({ 
                success: false,
                message: 'Desk not found' 
            });
        }

        const booking = desk.bookings.id(bookingId);
        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }

        booking.status = accept ? 'accepted' : 'cancelled';
        await desk.save();
        
        res.status(200).json({ 
            success: true,
            message: `Booking ${accept ? 'accepted' : 'cancelled'} successfully`, 
            data: booking 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error handling reservation request', 
            error: error.message 
        });
    }
};

export const checkBookingAvailability = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const { start, end } = req.query;
        
        const desk = await Desk.findById(req.params.id);
        if (!desk) {
            return res.status(404).json({ 
                success: false,
                message: 'Desk not found' 
            });
        }

        const isAvailable = !desk.bookings.some(booking => 
            booking.status === 'accepted' &&
            new Date(booking.start) <= new Date(end) &&
            new Date(booking.end) >= new Date(start)
        );

        res.status(200).json({ 
            success: true,
            message: 'Availability checked successfully', 
            data: { isAvailable } 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error checking booking availability', 
            error: error.message 
        });
    }
};
