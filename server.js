const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static('public'));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Menu items (hardcoded for this example)
const menuItems = [
  { name: 'Soupe kabouya', price: 200 },
  { name: 'Soupe basbas', price: 200 },
  { name: 'Soupe Batata', price: 200 },
  { name: 'Soupe des légumes', price: 200 },
  { name: 'Soupe des lentiles', price: 200 },
  { name: 'Loubia', price: 200 },
  { name: 'Salade Verte', price: 150 },
  { name: 'Salade de riz', price: 200 },
  { name: 'Salade César', price: 250 },
  { name: 'Boîte de frites', price: 150 },
  { name: 'Escalope marinée', price: 150 },
  { name: 'Escalope avec crème blanche', price: 250 },
  { name: 'Boîte de riz "Basmati"', price: 200 },
  { name: 'Plat Mtowam', price: 500 },
  { name: 'Chatitha lham', price: 500 },
  { name: 'Loubia machto sauce rouge', price: 500 },
  { name: 'Roule de poulet haché farci avec des épinards et fromage', price: 450 },
  { name: 'Couscous avec une cuisse de poulet ', price: 800 },
  { name: 'Rachta avec une cuisse de poulet', price: 800 },
  { name: 'Chakhchoukha avec cuisse de poulet', price: 800 }
];

// Route to serve the homepage (menu page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to get the menu items
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// Handle order submission
app.post('/api/submit-order', (req, res) => {
  const { name, phone, address, cart, totalPrice } = req.body;

  // Log the received order details to the server console
  console.log('Order Details:', { name, phone, address, cart, totalPrice });

  // Setup nodemailer to send the email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'seghirayoub488@gmail.com',  // Replace with your Gmail address
      pass: 'gsmb iquf maok rryu' // Replace with your Gmail app-specific password
    }
  });

  // Email content
  const mailOptions = {
    from: 'seghirayoub488@gmail.com',  // Replace with your Gmail address
    to: 'seghirayoub488@gmail.com',    // Replace with the email where you want to receive the orders
    subject: 'New Order Received',
    text: `
      You have a new order!

      Name: ${name}
      Phone: ${phone}
      Address: ${address}

      Ordered items:
      ${cart.map(item => `${item.name} - DZA${item.price}`).join('\n')}

      Total: DZA${totalPrice}
    `
  };

  // Send the email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending the order email.');
    }
    console.log('Email sent:', info.response);

    // If email is sent successfully, send the response back to the frontend
    res.status(200).json({ message: 'Order successfully received!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
