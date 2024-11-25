import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // You can use a different modal if preferred


const Entry = () => {
  const [email, setEmail] = useState('');
  const [password_hash, setPassword_hash] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password_hash };

    try {
      const response = await fetch('http://137.184.75.176:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();

      console.log(response)
      console.log(result)
      if (response.ok) {
        const user = { email: email, name : result.name ,token: "yourToken" };
        console.log(user)
        localStorage.setItem('user', JSON.stringify(user));
         navigate("/embroidory");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  
  return (
    <div className="login-page">
      <div className="offer-section">
        <h1>PRINT YOUR PASSION</h1>
        <h2>Custom tees that speak volumes</h2>
        <h3>Wear what you love ❤️</h3>
      </div>

      <div className="form-section">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password_hash}
              onChange={(e) => setPassword_hash(e.target.value)}
              required
              placeholder="Enter your password"
              className="input-field"
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
        </form>

        
        
      </div>

      
    </div>
  );
};

export default Entry;
