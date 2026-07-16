const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const baseUrl = 'http://localhost:5000/api/v1';

async function runTests() {
    console.log('--- STARTING API TESTS ---');

    // 1. Register a new Admin User
    console.log('\n1. Registering new Admin User...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Admin',
            email: 'admin' + Date.now() + '@travel.com', // Unique email every run
            password: 'password123',
            registrationKey: process.env.ADMIN_REGISTER_KEY
        })
    });
    const registerData = await registerRes.json();
    console.log('Response:', registerData);
    
    if (!registerData.success) {
        console.error('Failed to register user.');
        return;
    }
    const token = registerData.token;
    console.log('Successfully registered and received JWT token!');

    // 2. Try to create a Tour Package WITHOUT token (Should Fail)
    console.log('\n2. Attempting to create a Tour Package WITHOUT a token...');
    const failRes = await fetch(`${baseUrl}/tours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Unauthorized Tour',
            description: 'This should not work.',
            price: 500,
            duration: 3,
            itinerary: ['Day 1', 'Day 2']
        })
    });
    const failData = await failRes.json();
    console.log('Response:', failData);
    if (failRes.status === 401) {
        console.log('Success! The server correctly blocked the request (401 Unauthorized).');
    }

    // 3. Try to create a Tour Package WITH token (Should Succeed)
    console.log('\n3. Attempting to create a Tour Package WITH the JWT token...');
    const successRes = await fetch(`${baseUrl}/tours`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
            title: 'Bali Explorer',
            description: 'A wonderful 5 day trip to Bali.',
            price: 1200,
            duration: 5,
            itinerary: ['Arrival', 'Beach Day', 'Temple Visit', 'Free Day', 'Departure']
        })
    });
    const successData = await successRes.json();
    console.log('Response:', successData);
    if (successRes.status === 201) {
        console.log('Success! The server allowed the request and created the Tour Package.');
    }

    console.log('\n--- TESTS COMPLETE ---');
}

runTests();
