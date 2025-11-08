import { createDeskModel } from '../schemas/desk.schema.js';

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

export const updateDesk = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desk = await Desk.findByIdAndUpdate(req.params.deskId, req.body, { new: true });
        if (!desk) return res.status(404).json({ status: 404, message: 'Desk not found' });
        res.status(200).json({ status: 200, message: 'Desk updated successfully', data: desk });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error updating desk', error: error.message });
    }
};

export const deleteDesk = async (req, res) => {
    const Desk = createDeskModel(req.app.locals.desksDB);
    try {
        const desk = await Desk.findByIdAndDelete(req.params.deskId);
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
