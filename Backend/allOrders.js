const allOrdersTable = (db) => {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderNumber VARCHAR(255) NOT NULL , -- Unique order number
      orderStatus ENUM('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL', 'READY', 'INPROGRESS', 'DONE', 'ONHOLD', 'COMPLETED', 'DTGEMD') NOT NULL,
      orderMethod ENUM('ONLINE', 'OFFLINE') NOT NULL,
      jobType ENUM('EMBROIDERY', 'SCREEN PRINTING', 'DTG', 'DTG+EMB', 'SP+EMB') NOT NULL,
      clientName VARCHAR(255) NOT NULL,
      clientPhone  VARCHAR(255) NOT NULL,
      clientgmail VARCHAR(255) NOT NULL,
      shippingAddress TEXT,
      trackingLabel VARCHAR(255),
      garmentDetails TEXT,
      garmentPO VARCHAR(255),
      team ENUM('KARACHI TEAM', 'RIZ', 'MUSSA', 'BOB JOB') NOT NULL,
      dueDate DATE,
      orderQty INT, -- Total quantity, can be derived from size quantities if needed
      size_S INT DEFAULT 0,   -- Quantity for size S
      size_M INT DEFAULT 0,   -- Quantity for size M
      size_L INT DEFAULT 0,   -- Quantity for size L
      size_XL INT DEFAULT 0,  -- Quantity for size XL
      size_XXL INT DEFAULT 0, -- Quantity for size XXL
      size_3XL INT DEFAULT 0, -- Quantity for size 3XL
      size_4XL INT DEFAULT 0, -- Quantity for size 4XL
      size_5XL INT DEFAULT 0, -- Quantity for size 5XL
      invoice INT,
      notes TEXT,
      files TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     )`;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error creating orders table:', err);
      } else {
        console.log('Orders table created or already exists');
      }
    });
  };
  
  module.exports = allOrdersTable;
