const baseUrl = 'http://localhost:5000/api/v1';

async function runErrorTest() {
    console.log('--- STARTING ERROR HANDLING TEST ---');

    console.log('\nAttempting to register a user without providing required fields (name, email, password)...');
    
    try {
        const response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body to trigger validation errors
        });
        
        const data = await response.json();
        
        console.log('\nServer Response Status:', response.status);
        console.log('Server Response Body:\n', JSON.stringify(data, null, 2));
        
        if (response.status === 400 && data.success === false) {
            console.log('\nSUCCESS! The global error handler caught the Mongoose validation errors and returned a clean JSON response instead of crashing the server!');
        }
    } catch (err) {
        console.error('Test failed to run:', err.message);
    }
}

runErrorTest();
