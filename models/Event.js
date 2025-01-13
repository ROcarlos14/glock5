const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    ticketsSold: {
        type: Number,
        default: 0
    },
    image: String,
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
