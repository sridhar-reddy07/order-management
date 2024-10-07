import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // You can use a different modal if preferred
import './LoginPage.css';  // Import the custom CSS file

const Entry = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    try {
      const response = await fetch('http://137.184.75.176:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (response.ok) {
        const user = { email: email, token: "yourToken" };
        localStorage.setItem('user', JSON.stringify(user));
        user.email === "admin@gmail.com" ? navigate('/Home') : navigate("/riz");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const registerData = {
      email: registerEmail,
      password: registerPassword,
      name: registerName,
    };

    try {
      const response = await fetch('http://137.184.75.176:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        setShowRegisterModal(false);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error registering:', err);
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="input-field"
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
        </form>

        <div className="register-section">
          <p>Don’t have an account? <button onClick={() => setShowRegisterModal(true)} className="register-link">Register here</button></p>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                placeholder="Enter your name"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="input-field"
              />
            </div>
            <Button type="submit" className="submit-button">Register</Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Entry;
