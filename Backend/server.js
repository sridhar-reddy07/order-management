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




let connection;

function handleDisconnect() {
    connection = mysql.createConnection({
    host: process.env.DB_HOST,          // DigitalOcean DB Host
    user: process.env.DB_USER,          // DigitalOcean DB User
    password: process.env.DB_PASSWORD,  // DigitalOcean DB Password
    database: process.env.DB_NAME,      // DigitalOcean DB Name
    port: process.env.DB_PORT           // DigitalOcean DB Port (25060)
  });


  connection.connect(function (err) {
    if (err) {
      console.log('Error when connecting to DB:', err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    }
  });

  connection.on('error', function (err) {
    console.log('DB error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconnect if the connection was lost
    } else {
      throw err;
    }
  });
}

handleDisconnect();






// POST route for login validation
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  

  // Query to check if the user exists in the "users" table
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, result) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).json({ message: 'Error validating user' });
    } else if (result.length > 0) {
      // User exists and password matches
      res.status(200).json({ message: 'Login successful' });
    } else {
      // Invalid credentials
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});


  
  
  // Route to handle form submission
 // Step 4: Route to handle form submission
app.post('/addOrder', upload.array('files'), (req, res) => {
  const { 
    orderNumber, orderStatus, orderMethod, jobType, 
    clientName, shippingAddress, trackingLabel, garmentDetails, 
    garmentPo, team, dueDate, orderQty, notes 
  } = req.body;

  // Step 5: Handle the file uploads - get the S3 URLs
  const files = req.files ? req.files.map(file => file.location).join(',') : '';

  const sql = `INSERT INTO orders 
    (orderNumber, orderStatus, orderMethod, jobType, clientName, 
    shippingAddress, trackingLabel, garmentDetails, garmentPo, team, 
    dueDate, orderQty, notes, files) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [orderNumber, orderStatus, orderMethod, jobType, clientName, 
    shippingAddress, trackingLabel, garmentDetails, garmentPo, team, 
    dueDate, orderQty, notes, files], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred' });
    } else {
      res.status(200).json({ message: 'Order added successfully!' });
    }
  });
});



app.get('/ordersList', (req, res) => {
  const search = req.query.search || '';  // Get the search query from the request

  const sql = `
    SELECT *
    FROM orders
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL'))
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
    ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`; // Secondary sorting by orderNumber

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
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    ) And team = 'RIZ'
    ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`; // Secondary sorting by orderNumber

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
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL'))
    AND (
      orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
      clientName COLLATE utf8mb4_general_ci LIKE ? OR 
      shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
      trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
      jobType COLLATE utf8mb4_general_ci LIKE ? OR
      orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
      orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
      team COLLATE utf8mb4_general_ci LIKE ?
    ) And team = 'Mussa'
    ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`; // Secondary sorting by orderNumber

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
    WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL'))
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
    ORDER BY 
      CASE 
        WHEN orderStatus = 'HARDDATE' THEN 1
        ELSE 2
      END,
      orderNumber`; // Secondary sorting by orderNumber

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






  app.get('/wareHouseList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT *
      FROM orders
      WHERE (orderStatus IN ('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL'))
      AND (
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) And team = 'WAREHOUSE JOBS'
      ORDER BY 
        CASE 
          WHEN orderStatus = 'HARDDATE' THEN 1
          ELSE 2
        END,
        orderNumber`; // Secondary sorting by orderNumber
  
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
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD')
      AND jobType = 'EMBROIDERY') OR (orderStatus = 'DTGEMD' and jobType = 'DTG+EMB') )AND(
        orderNumber COLLATE utf8mb4_general_ci LIKE ? OR 
        clientName COLLATE utf8mb4_general_ci LIKE ? OR 
        shippingAddress COLLATE utf8mb4_general_ci LIKE ? OR 
        trackingLabel COLLATE utf8mb4_general_ci LIKE ? OR
        jobType COLLATE utf8mb4_general_ci LIKE ? OR
        orderMethod COLLATE utf8mb4_general_ci LIKE ? OR
        orderStatus COLLATE utf8mb4_general_ci LIKE ? OR
        team COLLATE utf8mb4_general_ci LIKE ?
      ) 
      `;// Secondary sorting by orderNumber
  
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
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD')
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
      `;// Secondary sorting by orderNumber
  
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
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD')
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
      `;// Secondary sorting by orderNumber
  
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
      WHERE ((orderStatus IN ('READY','INPROGRESS','ONHOLD')
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
      `;// Secondary sorting by orderNumber
  
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
      AND orderMethod = 'OFFLINE' AND(
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

  app.get('/completedList', (req, res) => {
    const search = req.query.search || '';  // Get the search query from the request
  
    const sql = `
      SELECT * 
      FROM orders
      WHERE orderStatus ='COMPLETED'
     AND(
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
  
  

  app.put('/updateOrderStatus/:orderNumber', async (req, res) => {
    const { orderNumber } = req.params;
    const { status } = req.body;
  
    // Log the status for debugging purposes
    console.log('Status:', status);
  
    try {
      // Use a parameterized query to avoid SQL injection and errors
      const query = 'UPDATE orders SET orderStatus = ? WHERE orderNumber = ?';
      
      db.query(query, [status, orderNumber], (err, result) => {
        if (err) {
          console.error('Error updating order status:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        
        // Check if any rows were updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
  
        // Send a successful response
        res.status(200).json({ message: 'Order status updated successfully', updatedOrder: { orderNumber, status } });
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


  //update order notes
  app.put('/updateordernotes/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const { ordernotes } = req.body;
    
    const sql = 'UPDATE orders SET notes = ? WHERE orderNumber = ?';
    
    db.query(sql, [ordernotes, orderNumber], (err, result) => {
      if (err) {
        console.error('Error updating notes:', err);
        res.status(500).json({ message: 'Error updating notes' });
      } else {
        res.status(200).json({ message: 'Notes updated successfully !! 😘' });
      }
    });
  });


  
  // Serve static files from 'uploads' directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  
  

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
