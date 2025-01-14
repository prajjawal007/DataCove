const express = require("express");
const router = express.Router();
const uploadFile = require("../config/supabase.config");
const multer = require('multer');
const authMiddleware = require("../middlewares/auhte"); // Corrected the spelling of "auth"
const fileModel = require("../models/file.model");
const path = require('path');

// Supabase client configuration (if you want to use it here as well)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client configuration
const supabaseUrl = 'https://rzhhkvwolmrqnfknguwf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aGhrdndvbG1ycW5ma25ndXdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjY4NTI4NCwiZXhwIjoyMDUyMjYxMjg0fQ.QT9AvCBkVtZvZIyCjaVLxrsJ4rO0GYkcf7Ub2gNai6c"; // Please use your own key
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer to store files temporarily
const upload = multer({ dest: 'uploads/' });

// Route to render home page with user's files
router.get('/home', authMiddleware, async (req, res) => {
    try {
        const userFiles = await fileModel.find({
            user: req.user.userId,
        });

        console.log(userFiles);

        res.render("home", {
            files: userFiles // Pass all user files to home.ejs
        });  // Render home.ejs
    } catch (error) {
        console.error("Error fetching user files:", error);
        res.status(500).send("Error fetching files.");
    }
});

// Handle file upload via POST request to /upload-file
router.post('/upload-file', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.log("No file uploaded.");
            return res.status(400).send("No file uploaded.");
        }

        console.log("File received:", req.file);  // Log the file details for debugging

        // Upload file to Supabase storage
        const file = req.file; 
        console.log(file); // Log file details

        const filePath = await uploadFile(file); // Upload to Supabase
        console.log('File uploaded to Supabase, path:', filePath);

        // After uploading, delete the file from local storage (optional)
        const fs = require('fs');
        fs.unlinkSync(file.path);  // Remove file from the temp directory

        // Save file information in the database
        const newFile = await fileModel.create({
            path: filePath,
            originalName: req.file.originalname,
            user: req.user.userId,
        });
         // Send response with alert and page reload
         res.send(`
            <script>
                alert("File Uploaded Successfully");
                window.location.href = "/home"; // Redirect to the homepage
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading file.");
    }
});

// Route for downloading a file
router.get("/download/:path", authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.user.userId; // Authenticated user ID
        const requestedPath = req.params.path; // File path from the URL

        console.log("Requested Path:", requestedPath);

        // Check if the file belongs to the logged-in user
        const file = await fileModel.findOne({
            user: loggedInUserId,
            path: requestedPath, // Ensure this matches your database schema
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found or unauthorized access",
            });
        }

        console.log("File found in database:", file);

        // Normalize the path before using it for generating signed URL
        const normalizedPath = requestedPath.replace(/\\/g, '/'); // Normalize path to forward slashes

        // Generate a signed URL from Supabase
        const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('uploads') // Ensure the bucket name is correct
            .createSignedUrl(normalizedPath, 60); // 60 seconds expiration

        if (signedUrlError) {
            console.error("Error generating signed URL:", signedUrlError);
            return res.status(500).json({ message: "Failed to generate download link" });
        }

        console.log("Generated Signed URL:", signedUrlData);

        // Redirect to the signed URL
        res.redirect(signedUrlData.signedUrl);
    } catch (error) {
        console.error("Error in /download/:path route:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
