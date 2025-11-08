import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { 
    getAllDesks, 
    getDeskById, 
    updateDesk, 
    deleteDesk,
    handleReservationRequest,
    checkBookingAvailability
} from '../crud/desk.crud.js';


const router = express.Router();


router.get("/", authenticate, (req, res) => {
    return res.status(200).json({ 
        success: true,
        message: "Desks route is working",
        user: req.user
    });
});

// Example: Only managers and admins can create desks
router.post("/", authenticate, authorize('manager', 'admin'), (req, res) => {
    return res.status(200).json({ 
        success: true,
        message: "Create desk endpoint (manager/admin only)" 
    });
});

// Get all desks
router.get("/all", authenticate, getAllDesks);

// Get a specific desk by ID
router.get("/:id", authenticate, getDeskById);

// Update a desk by ID
router.put("/:id", authenticate, authorize('manager', 'admin'), updateDesk);

// Delete a desk by ID
router.delete("/:id", authenticate, authorize('manager', 'admin'), deleteDesk);

// Handle reservation request
router.post("/:id/reservation", authenticate, authorize('manager', 'admin'), handleReservationRequest);

// Check booking availability
router.get("/:id/availability", authenticate, checkBookingAvailability);

export default router;

