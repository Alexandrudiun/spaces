import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserImage,
    getDesksWhereUserIsAttendee,
    getAllPositionsOfUser,
    updateUserRole
} from '../crud/user.crud.js';
const router = express.Router();

// Get all desks where the user is an attendee
router.get('/my-bookings', authenticate, authorize('user', 'manager', 'admin'), getDesksWhereUserIsAttendee);

// Get all users - admin only
router.get('/all', authenticate, authorize('admin', 'manager', 'managerHR', 'user'), getAllUsers);

// Get user by ID - admin or the user themselves
router.get('/:id', authenticate, getUserById);

// Create new user - admin only
router.post('/', authenticate, authorize('admin'), createUser);

// Update user - admin or the user themselves
router.put('/:id', authenticate, updateUser);

// Update user role
router.put('/role/:id', authenticate, authorize('admin'), updateUserRole);

// Update user image - admin or the user themselves
router.put('/:id/:image', authenticate, updateUserImage);

// Delete user - admin only
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Get all locations of user
router.post('/positions', authenticate, authorize('user', 'manager', 'admin'), getAllPositionsOfUser);


export default router;

