import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { email, password };

    // Send data to backend for validation
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      console.log(response)
      const result = await response.json();
      console.log(result)
      if (response.ok) {
        // If login is successful, store user data in localStorage
        const user = { email: email, token: "yourToken" };
        localStorage.setItem('user', JSON.stringify(user));  // A

        
        // Navigate to the addOrder page
        user.email === "admin@gmail.com" ? navigate('/Home') : navigate("/riz");

        
      } else {
        // Show error message
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
        <h2>Enter your info to Login</h2>
        <br />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter Username</label>
            <input
              type="text"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Enter Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">CONTINUE</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
