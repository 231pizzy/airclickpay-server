const express = require('express');
const router = express.Router();
const axios = require('axios'); // for making HTTP requests
const { User } = require('../models/userModel');

// Endpoint to initiate the verification process
router.post('/verify-identity/:userId', async (req, res) => {
    try {
        // Retrieve userId from the request params
        const { userId } = req.params;

        // Fetch user's details from the database using userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract user's first and last names
        const { firstName, lastName } = user;

        // Extract additional details from the request body
        const { dob, gender, bvn, phoneNumber } = req.body;

        // Combine the details fetched with the user's first and last names
        const userDetails = {
            firstName,
            lastName,
            dob,
            gender,
            bvn,
            phoneNumber
        };

        // Check if the provided BVN matches any BVN in the database
        const existingUserWithBVN = await User.findOne({ BVN: bvn });
        if (existingUserWithBVN) {
            return res.status(400).json({ error: 'BVN Linked to Another Account' });
        }

        // Check if user's verificationAttempts is not 0
        if (user.verificationAttempts === 0) {
            return res.status(400).json({ error: 'Exhausted Verification Trials, Please Contact Support' });
        }

        // Make an HTTP POST request to QoreID's API
        const qoreIdResponse = await axios.post(`https://api.qoreid.com/v1/ng/identities/bvn-basic/${bvn}`, {
            firstName,
            lastName,
        });

        user.level1IDVerifCompar = qoreIdResponse.data;
        user.dateOfBirth = dob;
        user.gender = gender;
        user.BVN = bvn;

        // Here you can add logic to compare the response with user details
        // If all details match exactly, you can proceed with further actions

        // Decrement the verificationAttempts field
        user.verificationAttempts = Math.max(0, user.verificationAttempts - 1);
        await user.save(); // Save the updated user data

        // For now, just return the userDetails
        return res.status(200).json(userDetails);
    } catch (error) {
        console.error('Error verifying identity:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


qoreid.com/v1/ng/identities/bvn-basic/95888168924