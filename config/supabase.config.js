const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase client configuration
const supabaseUrl = 'https://rzhhkvwolmrqnfknguwf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aGhrdndvbG1ycW5ma25ndXdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjY4NTI4NCwiZXhwIjoyMDUyMjYxMjg0fQ.QT9AvCBkVtZvZIyCjaVLxrsJ4rO0GYkcf7Ub2gNai6c"; // Please use your own key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to upload file to Supabase storage
async function uploadFile(file) {
    try {
        const filePath = path.normalize(`uploads/${file.originalname}`).replace(/\\/g, '/'); // Normalize and handle backslashes
        const { data, error } = await supabase.storage
            .from('uploads')  // Ensure the bucket name is correct
            .upload(filePath, fs.createReadStream(file.path), {
                contentType: file.mimetype,
                duplex:"half",
            });

        if (error) {
            console.error('Error uploading file to Supabase:', error);
            throw error;
        }

        console.log('File uploaded successfully:', data);
        return filePath; // Return the exact path for database storage
    } catch (error) {
        console.error('Error in uploadFile function:', error);
        throw error;
    }
}

module.exports = uploadFile;
