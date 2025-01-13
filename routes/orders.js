const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get all orders for a user
router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ 'user.email': req.params.email })
            .populate({
                path: 'tickets',
                populate: { path: 'event' }
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'tickets',
                populate: { path: 'event' }
            });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let paymentResult;

        // Handle payment based on method
        switch(req.body.paymentMethod) {
            case 'card':
                // Process Stripe payment
                paymentResult = await stripe.paymentIntents.create({
                    amount: req.body.totalAmount, // UGX amount (no cents)
                    currency: 'ugx',
                    payment_method: req.body.paymentMethodId,
                    confirm: true
                });
                break;

            case 'airtel':
            case 'mtn':
                // Simulate mobile money payment
                paymentResult = {
                    id: 'MM' + Date.now(),
                    status: 'pending'
                };
                break;

            default:
                throw new Error('Invalid payment method');
        }

        const order = new Order({
            tickets: req.body.ticketIds,
            user: {
                email: req.body.email,
                name: req.body.name,
                phone: req.body.phone
            },
            totalAmount: req.body.totalAmount,
            paymentMethod: req.body.paymentMethod,
            paymentId: paymentResult.id,
            paymentStatus: req.body.paymentMethod === 'card' ? 'completed' : 'pending'
        });

        const newOrder = await order.save({ session });
        await session.commitTransaction();

        res.status(201).json(newOrder);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// Update order status (for mobile money callback)
router.patch('/:id/status', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = req.body.status;
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
