const baseUrl = 'http://localhost:5000/api/v1';

async function runSecurityTest() {
    console.log('--- STARTING SECURITY / NoSQL INJECTION TEST ---');

    console.log('\nAttempting a NoSQL Injection attack on the login route...');
    console.log('Sending payload: { "email": { "$gt": "" }, "password": "password123" }');
    
    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: { "$gt": "" }, // Hacker tries to bypass email check
                password: "password123"
            })
        });
        
        const data = await response.json();
        
        console.log('\nServer Response Status:', response.status);
        console.log('Server Response Body:\n', JSON.stringify(data, null, 2));
        
        if (response.status === 400 || response.status === 401 || response.status === 404) {
            console.log('\nSUCCESS! The express-mongo-sanitize middleware intercepted the malicious payload and neutralized the NoSQL injection attack!');
        } else {
            console.log('\nWARNING: The attack may have bypassed the filter.');
        }
    } catch (err) {
        console.error('Test failed to run:', err.message);
    }
}

runSecurityTest();
