const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const userTable = require('./user');
const allOrdersTable = require('./allOrders');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3'); 
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config(); 



console.log("AWS Region:", process.env.AWS_REGION);  // Should output 'us-east-2'


// Step 2: Create an S3 instance
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Step 3: Set up multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'customermockfiles',
    
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Generate unique file name
    }
  })
});


const app = express()  
app.use(cors());
app.use(express.json());

// MySQL connection




let db

function handleDisconnect() {
    db = mysql.createConnection({
    host: process.env.DB_HOST,          // DigitalOcean DB Host
    user: process.env.DB_USER,          // DigitalOcean DB User
    password: process.env.DB_PASSWORD,  // DigitalOcean DB Password
    database: process.env.DB_NAME,      // DigitalOcean DB Name
    port: process.env.DB_PORT           // DigitalOcean DB Port (25060)
  });


  db.connect(function (err) {
    if (err) {
      console.log('Error when connecting to DB:', err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    }
  });

  db.on('error', function (err) {
    console.log('DB error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconnect if the connection was lost
    } else {
      throw err;
    }
  });
}

handleDisconnect();


const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// POST route for user registration
app.post('/register', async (req, res) => {
  const { email, password_hash, name } = req.body;

  // Check if all fields are provided
  if (!email || !password_hash || !name) {
    return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
  }

  try {
    // Check if the user already exists in the database
    const queryCheckUser = 'SELECT * FROM users WHERE email = ?';
    db.query(queryCheckUser, [email], async (err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.length > 0) {
        // User already exists
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10); // Generates salt for hashing
      const hashedPassword = await bcrypt.hash(password_hash, salt);

      // Insert the new user into the database
      const queryInsertUser = 'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)';
      db.query(queryInsertUser, [email, name, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting the user into the database:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        // Registration successful
        res.status(201).json({ message: 'Registration successful' });
      });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.post('/change-password', (req, res) => {
  const { email, newPassword } = req.body;
  console.log(req.body)

  // You should hash the new password before storing it in the database
  // For example, using bcrypt
  const bcrypt = require('bcrypt');
  const saltRounds = 10;

  bcrypt.hash(newPassword, saltRounds, (err, password_hash) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error hashing password.' });
    }

    // SQL query to update the password in the database
    const sql = 'UPDATE users SET password_hash = ? WHERE email = ?';

    // Execute the query with the hashed password and email
    db.query(sql, [password_hash, email], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ success: false, message: 'Password update failed.' });
      }

      if (result.affectedRows === 0) {
        // No user with that email was found
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Password updated successfully
      return res.json({ success: true, message: 'Password updated successfully.' });
    });
  });
});




app.get('/getOrderId', async (req, res) => {
  const { orderNumber, shippingAddress } = req.query;  // Extract orderNumber and shippingAddress from query parameters
  console.log(`Received request: orderNumber=${orderNumber}, shippingAddress=${shippingAddress}`);

  // Basic validation to ensure orderNumber and shippingAddress are provided
  if (!orderNumber || !shippingAddress) {
    return res.status(400).json({ message: 'Missing orderNumber or shippingAddress' });
  }

  try {
    // SQL query to get the order_id from the orders table using orderNumber and shippingAddress
    const queryStr = 'SELECT id FROM orders WHERE TRIM(orderNumber) = TRIM(?) AND TRIM(shippingAddress) = TRIM(?)';
    
    // Execute the query
    db.query(queryStr, [orderNumber, shippingAddress], (err, result) => {
      if (err) {
        console.error('Error querying MySQL:', err);
        return res.status(500).json({ message: 'Error validating user' });
      } 
      if (result.length === 0) {
        console.log('Order not found');
        return res.status(404).json({ message: 'Order not found' });
      } 
      console.log('Order ID:', result[0].id);
      return res.status(200).json({ order_id: result[0].id });
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});






// POST route for login validation
app.post('/login', (req, res) => {
  const { email, password_hash } = req.body;

  // Query to check if the user exists in the "users" table
  const query = 'SELECT * FROM users WHERE email =?';

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      return res.status(500).json({ message: 'Error validating user' });
    }

    if (result.length === 0) {
      // User with provided email does not exist
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get the user record
    const user = result[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password_hash, user.password_hash, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (isMatch) {
        // Passwords match, login successful
        return res.status(200).json({ message: 'Login successful' });
      } else {
        // Password does not match
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});


app.delete('/deleteorder/:id', (req, res) => {
  const { id } = req.params;

  // SQL query to delete the order from the database
  const sql = 'DELETE FROM orders WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting the order:', err);
      return res.status(500).json({ message: 'Failed to delete order' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  });
});
  
  
  // Route to handle form submission
 // Step 4: Route to handle form submission
 app.post('/addOrder', upload.array('files'), (req, res) => {
  const { 
    orderNumber, orderStatus, orderMethod, jobType, 
    clientName, clientPhone, clientgmail, shippingAddress, 
    trackingLabel, garmentDetails, garmentPO, team, 
    dueDate,  notes 
  } = req.body;

  // Step 5: Handle the file uploads - get the S3 URLs
  const files = req.files ? req.files.map(file => file.location).join(',') : '';

  

  const sql = `INSERT INTO orders 
   (orderNumber, orderStatus, orderMethod, jobType, clientName, clientPhone, clientgmail, shippingAddress, 
   trackingLabel, garmentDetails, garmentPO, team, dueDate ,notes, files) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    orderNumber, orderStatus, orderMethod, jobType, clientName, 
    clientPhone, clientgmail, shippingAddress, trackingLabel, 
    garmentDetails, garmentPO, team, dueDate,notes, files
  ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred' });
    } else {
      res.status(200).json({ message: 'Order added successfully!' });
    }
  });
});



app.put('/updateOrder/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // The field to update, e.g., { orderStatus: 'APPROVED' }

  const field = Object.keys(updateData)[0]; // Get the field name
  const value = updateData[field]; // Get the new value

  const query = `UPDATE orders SET ${field} = ? WHERE id = ?`;

  // Execute the SQL query
  db.query(query, [value, id], (err, result) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).send({ message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Order not found' });
    }

    // Respond with success message or the updated data
    res.status(200).send({ message: 'Order updated successfully', updatedField: { [field]: value } });
  });
});



app.get('/fetchorders/:order_id/sizes', (req, res) => {
  const orderId = req.params.order_id;
  console.log(orderId);

  const query = `
      SELECT * FROM orderSizes
      WHERE order_id = ?
  `;

  db.query(query, [orderId], (err, results) => {
      if (err) {
          console.error('Error fetching order sizes:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'No sizes found for this order' });
      }
      console.log(results)
      return res.status(200).json(results);
  });
});





app.post('/orders/:order_id/sizes', async (req, res) => {
  const { order_id } = req.params;
  const sizeData = req.body;

  // Log incoming data for debugging
  console.log('Received size data:', sizeData);

  // Ensure sizeData contains all necessary fields
  if (!sizeData.category || !sizeData.color) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // SQL query to insert size data into the database
    const query = `
      INSERT INTO orderSizes (order_id, category, description, color, xs, s, m, l, xl, xxl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Values to insert (ensure default values for missing sizes)
    const values = [
      order_id,
      sizeData.category,
      sizeData.description || '',
      sizeData.color,
      sizeData.xs || 0,
      sizeData.s || 0,
      sizeData.m || 0,
      sizeData.l || 0,
      sizeData.xl || 0,
      sizeData.xxl || 0,
    ];
    
    // Execute the SQL query
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting size data:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Send success response
      res.status(201).json({
        message: 'Size data added successfully',
        result,
      });
    });

  } catch (error) {
    console.error('Error adding size data:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});




app.get('/ordersList', (req, res) => {
  const search = req.query.search || '';  // Get the search query from the request

  const sql = `
    SELECT *
    FROM orders
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED',  'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    )
    `; // Secondary sorting by orderNumber

  const searchQuery = '%' + search + '%';

  db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
    if (err) {
      console.error('Error retrieving orders:', err);
      res.status(500).json({ message: 'Error retrieving orders' });
    } else {
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;

        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];

        return {
          ...order,
          files: fileLinks
        };
      });

      res.status(200).json(ordersWithFileLinks);
    }
  });
});



app.get('/rizList', (req, res) => {
  const search = req.query.search || '';  // Get the search query from the request

  const sql = `
    SELECT *
    FROM orders
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    ) And (team = 'RIZ' OR team = 'BOB JOB')
    `; // Secondary sorting by orderNumber

  const searchQuery = '%' + search + '%';

  db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
    if (err) {
      console.error('Error retrieving orders:', err);
      res.status(500).json({ message: 'Error retrieving orders' });
    } else {
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;

        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];

        return {
          ...order,
          files: fileLinks
        };
      });

      res.status(200).json(ordersWithFileLinks);
    }
  });
});



  

app.get('/mussaList', (req, res) => {
  const search = req.query.search || '';  // Get the search query from the request

  const sql = `
    SELECT *
    FROM orders
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    ) And team = 'MUSSA'
   `; // Secondary sorting by orderNumber

  const searchQuery = '%' + search + '%';

  db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
    if (err) {
      console.error('Error retrieving orders:', err);
      res.status(500).json({ message: 'Error retrieving orders' });
    } else {
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;

        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];

        return {
          ...order,
          files: fileLinks
        };
      });

      res.status(200).json(ordersWithFileLinks);
    }
  });
});


app.get('/karachiList', (req, res) => {
  const search = req.query.search || '';  // Get the search query from the request

  const sql = `
    SELECT *
    FROM orders
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED',  'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    ) And team = 'KARACHI TEAM'
    `; // Secondary sorting by orderNumber

  const searchQuery = '%' + search + '%';

  db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
    if (err) {
      console.error('Error retrieving orders:', err);
      res.status(500).json({ message: 'Error retrieving orders' });
    } else {
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;

        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];

        return {
          ...order,
          files: fileLinks
        };
      });

      res.status(200).json(ordersWithFileLinks);
    }
  });
});  






  app.get('/bobjobs', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT *
      FROM orders
      WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'PENDING APPROVAL'))
      AND (
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) And team = 'BOB JOB'
      `; // Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });
  
  app.get('/embroidoryList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD','HARDDATE')
      AND jobType = 'EMBROIDERY') OR (orderStatus = 'DTGEMD' and jobType = 'DTG+EMB') OR (orderStatus = 'DTGEMD' and jobType = 'SP+EMB') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`;// Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });

  
  app.get('/dtgList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD','HARDDATE')
      AND jobType = 'DTG') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`;// Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });

  app.get('/spList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD','HARDDATE')
      AND jobType = 'SCREEN PRINTING') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`;// Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });



  app.get('/dtgEmdList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD','HARDDATE')
      AND jobType = 'DTG+EMB') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`;// Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });


  app.get('/spEmdList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD','HARDDATE')
      AND jobType = 'SP+EMB') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`;// Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });



  app.get('/packingList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus IN ('DONE')
      AND orderMethod = 'ONLINE' AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      `; // Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });


  app.get('/instoreList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus IN ('DONE')
      AND orderMethod = 'WAREHOUSE JOBS' AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      `; // Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });


  app.get('/invoiceList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus IN ('DONE')
      AND orderMethod = 'WAREHOUSE JOBS' AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) And team = 'BOB JOB'
      `; // Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });

  app.get('/completdInvoiceList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus IN ('COMPLETD')
      AND orderMethod = 'WAREHOUSE JOBS' AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) And team = 'BOB JOB'
      `; // Secondary sorting by orderNumber
  
    const searchQuery = '%' + search + '%';
  
    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        res.status(500).json({ message: 'Error retrieving orders' });
      } else {
        const ordersWithFileLinks = result.map(order => {
          const files = order.files;
  
          // Check if files is a string, if not, initialize as empty string
          const fileLinks = (typeof files === 'string' && files) ? 
            files.split(',').map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Direct link to the file in S3
            })) : [];
  
          return {
            ...order,
            files: fileLinks
          };
        });
  
        res.status(200).json(ordersWithFileLinks);
      }
    });
  });





  app.get('/completedList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
    const fromDate = req.query.fromDate || '1970-01-01';  // Default start date if not provided
    const toDate = req.query.toDate || new Date().toISOString().slice(0, 10);  // Default to today if not provided
    const adjustedToDate = `${toDate} 23:59:59`;
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus = 'COMPLETED'
      AND createdAt BETWEEN ? AND ?
      AND (
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      )
      ORDER BY createdAt DESC`; // Sorting by the order creation/completion date
  
    const searchQuery = '%' + search + '%';
  
    // Execute the query with the fromDate, toDate, and search filters
    db.query(sql, [fromDate, adjustedToDate, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        return res.status(500).json({ message: 'Error retrieving orders' });
      }
  
      // Map over the result to process file links
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;
  
        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];
  
        return {
          ...order,
          files: fileLinks
        };
      });
  
      res.status(200).json(ordersWithFileLinks);
    });
  });



  app.get('/pullsheetList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
    const fromDate = req.query.fromDate || '1970-01-01';  // Default start date if not provided
    const toDate = req.query.toDate || new Date().toISOString().slice(0, 10);  // Default to today if not provided
  
    // Adjust the end of the date range to include the entire day
    const adjustedToDate = `${toDate} 23:59:59`;

    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus = 'READY'
      AND createdAt BETWEEN ? AND ?
      AND (
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      )
      ORDER BY createdAt DESC`; // Sorting by the order creation/completion date
  
    const searchQuery = '%' + search + '%';
  
    // Execute the query with the fromDate, adjustedToDate, and search filters
    db.query(sql, [fromDate, adjustedToDate, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, result) => {
      if (err) {
        console.error('Error retrieving orders:', err);
        return res.status(500).json({ message: 'Error retrieving orders' });
      }
  
      // Map over the result to process file links
      const ordersWithFileLinks = result.map(order => {
        const files = order.files;
  
        // Check if files is a string, if not, initialize as empty string
        const fileLinks = (typeof files === 'string' && files) ? 
          files.split(',').map(fileUrl => ({
            fileUrl,
            downloadLink: fileUrl // Direct link to the file in S3
          })) : [];
  
        return {
          ...order,
          files: fileLinks
        };
      });
  
      res.status(200).json(ordersWithFileLinks);
    });
  });



  app.get('/pieorders', (req, res) => {
    const { team } = req.query;
  
    // Query to get orders grouped by jobType and orderStatus for the selected team
    const query = `
      SELECT jobType, orderStatus, COUNT(*) as count
      FROM orders
      WHERE team = ?
      GROUP BY jobType, orderStatus
    `;
  
    db.query(query, [team], (err, results) => {
      if (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Error fetching orders');
        return;
      }
      
      // Process the results into different categories for Embroidery, Screen Printing, and DTG
      const totalOrders = results
        .map(order => ({ name: order.jobType, value: order.count }))
        .reduce((acc, current) => {
          const existing = acc.find(item => item.name === current.name);
          if (existing) {
            existing.value += current.value; // Sum the values for duplicates
          } else {
            acc.push(current);
          }
          return acc;
        }, []);
      const embroideryOrders = results
        .filter(order => order.jobType === 'EMBROIDERY')
        .map(order => ({ name: order.orderStatus, value: order.count }));
  
      const screenPrintingOrders = results
        .filter(order => order.jobType === 'SCREEN PRINTING')
        .map(order => ({ name: order.orderStatus, value: order.count }));
  
      const dtgOrders = results
        .filter(order => order.jobType === 'DTG' )
        .map(order => ({ name: order.orderStatus, value: order.count }));
      const dtgEmbOrders = results
        .filter(order => order.jobType === 'DTG+EMB' )
        .map(order => ({ name: order.orderStatus, value: order.count }));
      console.log(totalOrders, embroideryOrders, screenPrintingOrders, dtgOrders)
      res.json({ totalOrders, embroideryOrders, screenPrintingOrders, dtgOrders,dtgEmbOrders});
    });
  });
  
  

  app.put('/updateOrderStatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    // Log the status for debugging purposes
    console.log('Status:', status);
  
    try {
      // Use a parameterized query to avoid SQL injection and errors
      const query = 'UPDATE orders SET orderStatus = ? WHERE id = ?';
      
      db.query(query, [status, id], (err, result) => {
        if (err) {
          console.error('Error updating order status:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        
        // Check if any rows were updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
  
        // Send a successful response
        res.status(200).json({ message: 'Order status updated successfully', updatedOrder: { id , status } });
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.put('/updateTrackingLabel/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const { trackingLabel } = req.body;
    
    const sql = 'UPDATE orders SET trackingLabel = ? WHERE orderNumber = ?';
    
    db.query(sql, [trackingLabel, orderNumber], (err, result) => {
      if (err) {
        console.error('Error updating tracking label:', err);
        res.status(500).json({ message: 'Error updating tracking label' });
      } else {
        res.status(200).json({ message: 'Tracking label updated successfully' });
      }
    });
  });


  app.post('/addInvoice', (req, res) => {
    const { orderNumber, invoice ,shippingAddress} = req.body;
    console.log(req.body);

    if (isNaN(invoice)) {
      return res.status(400).json({ message: 'Invalid invoice amount' });
  }

    // SQL query to update the order with the invoice details
    const sql = `
        UPDATE orders 
        SET invoice = ?
        WHERE TRIM(orderNumber) = TRIM(?) AND TRIM(shippingAddress) = TRIM(?)
    `;

    db.query(sql, [invoice, orderNumber,shippingAddress], (err, result) => {
        if (err) {
            console.error('Error updating invoice:', err);
            res.status(500).json({ message: 'Error adding invoice' });
        } else {
            res.status(200).json({ message: 'Invoice added successfully' });
        }
    });
});




app.post('/api/orders/:orderId/files', upload.array('files'), (req, res) => {
  const { orderId } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  console.log(req.files)

  // Map file URLs (assuming S3 URL is stored in `location` property)
  let fileUrls = req.files.map(file => file.location); 
  
  console.log(fileUrls)

  const filesString = fileUrls.join(',');

  const sql = `UPDATE orders SET files = IFNULL(CONCAT(files, ',' , ?), ?) WHERE id = ?`;
  db.query(sql, [filesString, filesString, orderId], (err, result) => {
    if (err) {
      console.error('Error saving files to database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    fileUrls = Array.isArray(req.files) ? req.files.map(file => file.location) : [];
    console.log(fileUrls)
    res.status(200).json({
      message: 'Files uploaded successfully',
      fileUrls: fileUrls, // Ensure this is an array
    });
  });
});



const { DeleteObjectCommand } = require('@aws-sdk/client-s3');



app.delete('/api/orders/:orderId/files', async (req, res) => {
  const { orderId } = req.params;
  const { fileUrl } = req.body;

  // Validate required fields
  if (!fileUrl) {
    return res.status(400).json({ message: 'File URL is required for deletion' });
  }
  if (!process.env.S3_BUCKET_NAME) {
    console.error('S3_BUCKET_NAME is not set in .env');
    return res.status(500).json({ message: 'S3 bucket configuration is missing' });
  }

  // Extract the file name for the S3 Key
  const fileName = fileUrl.split('/').pop();

  try {
    // S3 Deletion
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
    }));
    console.log(`File ${fileName} deleted successfully from S3`);

    // Update the database to remove the file URL
    const sql = `UPDATE orders SET files = REPLACE(files, ?, '') WHERE id = ?`;
    db.query(sql, [fileUrl, orderId], (err, result) => {
      if (err) {
        console.error('Database error while removing file URL:', err);
        return res.status(500).json({ message: 'Database update failed' });
      }
      if (result.affectedRows === 0) {
        console.warn(`Order ID ${orderId} not found in database`);
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(200).json({ message: 'File successfully deleted from S3 and database' });
    });
  } catch (s3Error) {
    console.error('Error during S3 file deletion:', s3Error);
    return res.status(500).json({ message: 'Failed to delete file from S3' });
  }
});

  
// Node.js Express handler for sorted orders
app.get('/orders/sorted', (req, res) => {
  // Prepare the search term
  const sortByPO = req.query.sortByPO === 'true';  // Determine the sort direction from the query parameter

  // SQL query to search and sort by extracted date from the `garmentPO` field
  const sql = `
    SELECT * 
       
    FROM orders
   
    ORDER BY  garmentPO ${sortByPO ? 'ASC' : 'DESC'};`;

  // Execute the query with the search filter
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error retrieving orders:', err);
          return res.status(500).json({ message: 'Error retrieving orders' });
      }

      // Map over the result to process file links
      const ordersWithFileLinks = results.map(order => {
          const files = order.files || '';
          const fileLinks = files.split(',')
            .filter(link => link.trim() !== '')
            .map(fileUrl => ({
              fileUrl,
              downloadLink: fileUrl // Modify this if you're using specific methods for secure file access
            }));

          return {
              ...order,
              files: fileLinks,
              PODate: order.PODate.toLocaleDateString() // Format the date for clarity
          };
      });

      res.status(200).json(ordersWithFileLinks);
  });
});









  // Serve static files from 'uploads' directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  
  

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
