// src/Login.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in local storage
    const token = localStorage.getItem('linkedinAccessToken');
    if (token) {
      // If token exists, redirect to /posts
      navigate('/posts');
    }
  }, [navigate]);

  const handleLinkedInLogin = () => {

    axios.get("http://localhost:3060/auth/linkedin").then(({ data }) => {
      console.log(data)
    })
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <button onClick={handleLinkedInLogin} className="linkedin-button">
        Login with LinkedIn
      </button>
      {/* You can add other login options here (e.g., email/password) */}
    </div>
  );
};

export default Login;
