const allOrdersTable = (db) => {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderNumber VARCHAR(255) NOT NULL,
        orderStatus ENUM('PENDING', 'NEED PAYMENT', 'PENDING ARTWORK', 'APPROVED', 'HARDDATE', 'PENDING APPROVAL', 'READY','INPROGRESS','DONE','ONHOLD','COMPLETED','DTGEMD') NOT NULL,
        orderMethod ENUM('ONLINE', 'OFFLINE') NOT NULL,
        jobType ENUM('EMBROIDERY', 'SCREEN PRINTING', 'DTG', 'DTG+EMB') NOT NULL,
        clientName VARCHAR(255) NOT NULL,
        shippingAddress TEXT,
        trackingLabel VARCHAR(255),
        garmentDetails TEXT,
        garmentPo VARCHAR(255),
        team ENUM('KARACHI TEAM', 'RIZ', 'MUSSA','WAREHOUSE JOBS') NOT NULL,
        dueDate DATE,
        orderQty INT,
        notes TEXT,
        files TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error creating orders table:', err);
      } else {
        console.log('Orders table created or already exists');
      }
    });
  };
  
  module.exports = allOrdersTable;
