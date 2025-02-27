// Install required packages: npm install express axios dotenv path
const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
console.log(FLUTTERWAVE_SECRET_KEY);

// Serve static files (like index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to render index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verify payment route
app.get('/verify-payment/:transaction_id', async (req, res) => {
    const { transaction_id } = req.params;
    const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}` }
        });

        if (response.data.status === 'success') {
            return res.status(200).json({ message: 'Payment verified successfully!', data: response.data.data });
        } else {
            return res.status(400).json({ message: 'Payment verification failed.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error connecting to Flutterwave.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
