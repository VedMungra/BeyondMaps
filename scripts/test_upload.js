const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:5000/api/v1';

async function runUploadTest() {
    console.log('--- STARTING FILE UPLOAD TEST ---');

    try {
        // 1. Log in to get a token
        console.log('\n1. Logging in as Admin...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin' + Date.now() + '@travel.com', password: 'password123' }) // Wait, we need an existing user or we can register a new one. Let's register a new one just in case.
        });
        
        // Actually let's just register a new one to guarantee it works.
        const registerRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Upload Tester', email: 'uploader' + Date.now() + '@travel.com', password: 'password123' })
        });
        const registerData = await registerRes.json();
        const token = registerData.token;
        console.log('Successfully registered and got token!');

        // 2. Create a Tour Package to attach the photo to
        console.log('\n2. Creating a temporary Tour Package...');
        const tourRes = await fetch(`${baseUrl}/tours`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                title: 'Photo Upload Test Tour',
                description: 'Just testing the upload feature.',
                price: 999,
                duration: 2,
                itinerary: ['Test Day 1']
            })
        });
        const tourData = await tourRes.json();
        const tourId = tourData.data._id;
        console.log(`Successfully created Tour Package (ID: ${tourId})`);

        // 3. Create a dummy image file locally to upload
        console.log('\n3. Creating a dummy image file to upload...');
        const dummyFilePath = path.join(__dirname, 'dummy-image.jpg');
        fs.writeFileSync(dummyFilePath, 'This is fake image data to test multer');

        // 4. Upload the image using FormData
        console.log('\n4. Attempting to upload the image...');
        
        // Node 18+ FormData requires Blob/File objects, or we can use the 'form-data' package.
        // Since we don't have 'form-data' installed, let's use the built-in FormData and Blob.
        const fileBuffer = fs.readFileSync(dummyFilePath);
        const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('file', fileBlob, 'dummy-image.jpg');

        const uploadRes = await fetch(`${baseUrl}/tours/${tourId}/photo`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadData = await uploadRes.json();
        console.log('\nServer Response Status:', uploadRes.status);
        console.log('Server Response Body:\n', JSON.stringify(uploadData, null, 2));

        if (uploadRes.status === 200 && uploadData.data.photo !== 'no-photo.jpg') {
            console.log('\nSUCCESS! The image was uploaded and the database was updated with the new filename:', uploadData.data.photo);
        } else {
            console.log('\nWARNING: The upload may have failed.');
        }

        // Cleanup dummy file
        fs.unlinkSync(dummyFilePath);

    } catch (err) {
        console.error('Test failed to run:', err.message);
    }
}

runUploadTest();
