const axios = require('axios');

const API_URL = process.env.VERCEL_URL || 'http://localhost:3000';

const testEndpoints = async () => {
    try {
        // Test health endpoint
        console.log('\nTesting Health Endpoint...');
        const healthResponse = await axios.get(`${API_URL}/api/health`);
        console.log('Health Check Response:', healthResponse.data);

        // Test Events endpoints
        console.log('\nTesting Events Endpoints...');
        const eventsResponse = await axios.get(`${API_URL}/api/events`);
        console.log('Events Count:', eventsResponse.data.length);

        // Test creating an event
        const newEvent = {
            title: 'Test Concert',
            date: new Date('2025-02-15'),
            location: 'Test Venue, Kampala',
            description: 'Test concert description',
            price: 50000,
            capacity: 1000
        };
        const createEventResponse = await axios.post(`${API_URL}/api/events`, newEvent);
        console.log('Created Event:', createEventResponse.data);

        // Test Tickets endpoints
        console.log('\nTesting Tickets Endpoints...');
        const ticketsResponse = await axios.get(`${API_URL}/api/tickets/user/test@example.com`);
        console.log('User Tickets:', ticketsResponse.data);

        // Test creating a ticket
        const newTicket = {
            eventId: createEventResponse.data._id,
            email: 'test@example.com',
            name: 'Test User',
            phone: '+256123456789',
            ticketType: 'regular',
            price: 50000,
            paymentMethod: 'mtn'
        };
        const createTicketResponse = await axios.post(`${API_URL}/api/tickets`, newTicket);
        console.log('Created Ticket:', createTicketResponse.data);

    } catch (error) {
        console.error('Test Error:', error.response ? error.response.data : error.message);
    }
};

// Run tests
console.log('Starting API Tests...');
testEndpoints();
