import { createDeskModel } from '../schemas/desk.schema.js';
import { createUserModel } from '../schemas/user.schema.js';

export const createDesk = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desk = await Desk.create(req.body);
        res.status(201).json({ status: 201, message: 'Desk created successfully', data: desk });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error creating desk', error: error.message });
    }
};

export const getAllDesks = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desks = await Desk.find().populate('bookings');
        res.status(200).json({ status: 200, message: 'Desks retrieved successfully', data: desks });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error retrieving desks', error: error.message });
    }
};

export const getDeskById = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desk = await Desk.findById(req.params.id).populate('bookings');
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });
        res.status(200).json({ status: 200, message: 'Desk retrieved successfully', data: desk });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error retrieving desk', error: error.message });
    }
};
export const updateBookingFromDesk = async (req, res) => {
    try {
        const Desk = createDeskModel(req.app.locals.desksDB);
        const { id } = req.params; // Desk ID
        const { bookingId, status } = req.body;

        // Validate status according to your schema
        const validStatuses = ['pending', 'accepted', 'declined', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: pending, accepted, declined, cancelled' 
            });
        }

        // Find the desk and update the specific booking status
        const updatedDesk = await Desk.findOneAndUpdate(
            {
                _id: id,
                'bookings._id': bookingId
            },
            {
                $set: {
                    'bookings.$.status': status,
                    'bookings.$.updatedAt': new Date() // Update the booking's updatedAt timestamp
                }
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Ensure enum validation runs
            }
        ).populate('bookings.attendees', 'name email'); // Optional: populate attendee details

        if (!updatedDesk) {
            return res.status(404).json({ 
                error: 'Desk or booking not found' 
            });
        }

        // Find the updated booking in the array
        const updatedBooking = updatedDesk.bookings.id(bookingId);

        res.status(200).json({
            message: 'Booking status updated successfully',
            booking: updatedBooking,
            desk: updatedDesk
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error',
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to update booking status',
            details: error.message 
        });
    }
};



export const deleteDesk = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desk = await Desk.findByIdAndDelete(req.params.id);
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });
        res.status(200).json({ status: 200, message: 'Desk deleted successfully', data: desk });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error deleting desk', error: error.message });
    }
};

export const handleReservationRequest = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    const { deskId, bookingId, accept } = req.params;
    try {
        const desk = await Desk.findById(deskId);
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });

        const booking = desk.bookings.id(bookingId);
        if (!booking) return res.status(404).json({ status: 404, message: 'Booking not found' });

        booking.status = accept ? 'accepted' : 'cancelled';
        await desk.save();
        
        res.status(200).json({ status: 200, message: `Booking ${accept ? 'accepted' : 'cancelled'} successfully`, data: booking });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error handling reservation request', error: error.message });
    }
};

export const checkBookingAvailability = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    const { deskId, start, end } = req.params;
    try {
        const desk = await Desk.findById(deskId);
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });

        const isAvailable = !desk.bookings.some(booking => 
            booking.status === 'accepted' &&
            booking.start <= end &&
            booking.end >= start
        );

        res.status(200).json({ status: 200, message: 'Availability checked successfully', data: { isAvailable } });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error checking booking availability', error: error.message });
    }
};

export const bookDesk = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    const deskId = req.params.id;
    const { start, end, attendees } = req.body;

    try {
        const desk = await Desk.findById(deskId);
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });

        const startDate = new Date(start);
        const endDate = new Date(end);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
            return res.status(400).json({ status: 400, message: 'Invalid start or end time' });
        }

        // Check for overlap with any accepted booking
        const s = startDate.getTime();
        const e = endDate.getTime();
        const hasOverlap = (desk.bookings || []).some(b => {
            if (b.status !== 'accepted') return false;
            const bStart = new Date(b.start).getTime();
            const bEnd = new Date(b.end).getTime();
            return !(bEnd <= s || bStart >= e);
        });

        if (hasOverlap) {
            return res.status(409).json({ status: 409, message: 'Desk already booked for the requested time range' });
        }

        // Build new booking (query users for attendee IDs using a single DB query)
        let userAttendees = [];
        if (Array.isArray(attendees) && attendees.length > 0) {
            // Expect a Mongoose connection that has a User model accessible via app.locals.usersDB
            const User = createUserModel(req.app.locals.usersDB);
            // Fetch all users whose _id is in the attendees array with one query
            userAttendees = await User.find({ _id: { $in: attendees } });
        }
        const newBooking = {
            start: startDate,
            end: endDate,
            status: 'pending',
            attendees: userAttendees,
        };

        // Ensure arrays exist
        desk.bookings = desk.bookings || [];
        desk.bookings.push(newBooking);

        await desk.save();

        res.status(201).json({ status: 201, message: 'Booking created successfully', data: newBooking });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error creating booking', error: error.message });
    }
};