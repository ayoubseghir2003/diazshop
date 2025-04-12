// backend/index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// JWT secret key
const SECRET_KEY = 'supersecretkey';

// In-memory orders and users (demo purposes)
let orders = [
  { id: '1', client: 'Ahmed', address: 'Algiers', total: 1000, status: 'pending' },
  { id: '2', client: 'Khadija', address: 'Oran', total: 750, status: 'pending' },
];

let USERS = []; // Will hold { phone, username }

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins for development. Customize for production.
app.use(express.static('public'));
app.use('/static', express.static(path.join(__dirname, 'static')));

// --- LOGIN WITH PHONE NUMBER ---
app.post('/login', (req, res) => {
  const { phone, username } = req.body;
  if (!phone || !username) {
    return res.status(400).json({ message: 'Phone number and username are required' });
  }

  let user = USERS.find(u => u.phone === phone);
  if (!user) {
    user = { phone, username };
    USERS.push(user);
  }

  // Create token
  const token = jwt.sign({ phone, username }, SECRET_KEY, { expiresIn: '2h' });
  res.json({ token });
});

// --- AUTH MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No authorization header provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing from header' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Store user info for later if needed
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// --- GET ORDERS ---
app.get('/orders', authenticate, (req, res) => {
  res.json(orders);
});

// --- UPDATE ORDER STATUS ---
app.post('/orders/:id/status', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  order.status = status;
  res.json({ message: `Order ${id} status updated to "${status}"` });
});

// --- SUBMIT ORDER (EMAIL) ---
app.post('/api/submit-order', (req, res) => {
  const { name, phone, address, cart, totalPrice, deliveryPrice } = req.body;

  if (!name || !phone || !address || !cart || totalPrice == null || deliveryPrice == null) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'seghirayoub488@gmail.com',
      pass: 'gsmb iquf maok rryu', // WARNING: Store securely using env variables!
    },
  });

  const mailOptions = {
    from: 'seghirayoub488@gmail.com',
    to: 'seghirayoub488@gmail.com',
    subject: 'New Order Received',
    text: `
New Order:
Name: ${name}
Phone: ${phone}
Address: ${address}

Items:
${cart.map(item => `${item.name} - DZA${item.price}`).join('\n')}

Total: DZA${totalPrice}
Delivery: DZA${deliveryPrice}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({ message: 'Failed to send email', error });
    }

    const newOrder = {
      id: String(Date.now()),
      client: name,
      address,
      total: totalPrice + deliveryPrice,
      status: 'pending',
    };
    orders.push(newOrder);

    res.status(200).json({ message: 'Order received!' });
  });
});

// --- SERVER START ---
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
