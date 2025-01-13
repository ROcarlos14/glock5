const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        email: {
            type: String,
            required: true
        },
        name: String,
        phone: String
    },
    ticketType: {
        type: String,
        enum: ['regular', 'vip', 'vvip'],
        default: 'regular'
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'airtel', 'mtn'],
        required: true
    },
    paymentId: String,
    ticketNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate unique ticket number before saving
ticketSchema.pre('save', function(next) {
    if (!this.ticketNumber) {
        this.ticketNumber = 'GLK' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
