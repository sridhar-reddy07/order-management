// user.js

const userTable = (db) => {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table created or already exists');
      }
    });
  };
  
  module.exports = userTable;
  