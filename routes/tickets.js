const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Get all tickets for a user
router.get('/user/:email', async (req, res) => {
    try {
        const tickets = await Ticket.find({ 'user.email': req.params.email })
            .populate('event')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific ticket
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('event');
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Purchase ticket
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const event = await Event.findById(req.body.eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        if (event.ticketsSold >= event.capacity) {
            throw new Error('Event is sold out');
        }

        const ticket = new Ticket({
            event: req.body.eventId,
            user: {
                email: req.body.email,
                name: req.body.name,
                phone: req.body.phone
            },
            ticketType: req.body.ticketType,
            price: req.body.price,
            paymentMethod: req.body.paymentMethod,
            paymentId: req.body.paymentId
        });

        const newTicket = await ticket.save({ session });

        event.ticketsSold += 1;
        await event.save({ session });

        await session.commitTransaction();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Ticket Confirmation - Glock 5 Concert',
            html: `
                <h1>Thank you for your purchase!</h1>
                <p>Here are your ticket details:</p>
                <ul>
                    <li>Event: ${event.title}</li>
                    <li>Date: ${event.date}</li>
                    <li>Location: ${event.location}</li>
                    <li>Ticket Type: ${req.body.ticketType}</li>
                    <li>Ticket Number: ${newTicket.ticketNumber}</li>
                </ul>
                <p>Please show this ticket at the entrance.</p>
            `
        };

        transporter.sendMail(mailOptions);

        res.status(201).json(newTicket);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// Cancel ticket
router.patch('/:id/cancel', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const ticket = await Ticket.findById(req.params.id).populate('event');
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        if (ticket.status === 'cancelled') {
            throw new Error('Ticket is already cancelled');
        }

        ticket.status = 'cancelled';
        await ticket.save({ session });

        const event = ticket.event;
        event.ticketsSold -= 1;
        await event.save({ session });

        await session.commitTransaction();

        // Send cancellation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ticket.user.email,
            subject: 'Ticket Cancellation - Glock 5 Concert',
            html: `
                <h1>Ticket Cancellation Confirmation</h1>
                <p>Your ticket has been cancelled:</p>
                <ul>
                    <li>Event: ${event.title}</li>
                    <li>Ticket Number: ${ticket.ticketNumber}</li>
                </ul>
                <p>Refund will be processed within 5-7 business days.</p>
            `
        };

        transporter.sendMail(mailOptions);

        res.json(ticket);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
