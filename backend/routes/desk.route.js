import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { 
    getAllDesks, 
    getDeskById, 
    updateBookingFromDesk, 
    deleteDesk,
    handleReservationRequest,
    checkBookingAvailability,
    createDesk,
    bookDesk,
} from '../crud/desk.crud.js';


const router = express.Router();


// Create desk
router.post("/", authenticate, authorize('manager', 'admin'),  createDesk);

// Get all desks
router.get("/all", authenticate, getAllDesks);

// Get a specific desk by ID
router.get("/:id", authenticate, getDeskById);

// Update a booking by ID
router.put("/:id", authenticate, authorize('manager', 'admin'), updateBookingFromDesk);

// Delete a desk by ID
router.delete("/:id", authenticate, authorize('manager', 'admin'), deleteDesk);

// Handle reservation request
router.post("/:id/reservation", authenticate, authorize('manager', 'admin'), handleReservationRequest);

// Check booking availability
router.get("/:id/availability", authenticate, checkBookingAvailability);

// Book a desk
router.post("/book/:id", authenticate, authorize('user', 'manager', 'admin'), bookDesk);

export default router;

