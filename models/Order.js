const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tickets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }],
    user: {
        email: {
            type: String,
            required: true
        },
        name: String,
        phone: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'airtel', 'mtn'],
        required: true
    },
    paymentId: String,
    orderNumber: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate unique order number before saving
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
