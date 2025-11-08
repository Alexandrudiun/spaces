import { createDeskModel } from '../schemas/desk.schema.js';
import { getConnection } from '../config/database.js';

const Desk = createDeskModel(getConnection());

export const getAllDesks = async () => {
    try {
        const desks = await Desk.find().populate('bookings');
        return { status: 200, message: 'Desks retrieved successfully', data: desks };
    } catch (error) {
        return { status: 500, message: 'Error retrieving desks', error: error.message };
    }
};

export const getDeskById = async (deskId) => {
    try {
        const desk = await Desk.findById(deskId).populate('bookings');
        if (!desk) return { status: 404, message: 'Desk not found' };
        return { status: 200, message: 'Desk retrieved successfully', data: desk };
    } catch (error) {
        return { status: 500, message: 'Error retrieving desk', error: error.message };
    }
};

export const updateDesk = async (deskId, updateData) => {
    try {
        const desk = await Desk.findByIdAndUpdate(deskId, updateData, { new: true });
        if (!desk) return { status: 404, message: 'Desk not found' };
        return { status: 200, message: 'Desk updated successfully', data: desk };
    } catch (error) {
        return { status: 500, message: 'Error updating desk', error: error.message };
    }
};

export const deleteDesk = async (deskId) => {
    try {
        const desk = await Desk.findByIdAndDelete(deskId);
        if (!desk) return { status: 404, message: 'Desk not found' };
        return { status: 200, message: 'Desk deleted successfully', data: desk };
    } catch (error) {
        return { status: 500, message: 'Error deleting desk', error: error.message };
    }
};

export const handleReservationRequest = async (deskId, bookingId, accept) => {
    try {
        const desk = await Desk.findById(deskId);
        if (!desk) return { status: 404, message: 'Desk not found' };

        const booking = desk.bookings.id(bookingId);
        if (!booking) return { status: 404, message: 'Booking not found' };

        booking.status = accept ? 'accepted' : 'cancelled';
        await desk.save();
        
        return { 
            status: 200, 
            message: `Booking ${accept ? 'accepted' : 'cancelled'} successfully`, 
            data: booking 
        };
    } catch (error) {
        return { status: 500, message: 'Error handling reservation request', error: error.message };
    }
};

export const checkBookingAvailability = async (deskId, start, end) => {
    try {
        const desk = await Desk.findById(deskId);
        if (!desk) return { status: 404, message: 'Desk not found' };

        const isAvailable = !desk.bookings.some(booking => 
            booking.status === 'accepted' &&
            booking.start <= end &&
            booking.end >= start
        );

        return { 
            status: 200, 
            message: 'Availability checked successfully', 
            data: { isAvailable } 
        };
    } catch (error) {
        return { status: 500, message: 'Error checking booking availability', error: error.message };
    }
};
