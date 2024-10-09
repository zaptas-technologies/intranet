import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State for storing user details
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const storedToken = localStorage.getItem('linkedinToken');

    if (storedToken) {
      fetchLinkedInData(storedToken);
    } else {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');

      if (token) {
        localStorage.setItem('linkedinToken', token);
        fetchLinkedInData(token);
      }
    }
  }, [navigate]);

  const fetchLinkedInData = async (token) => {
    try {
      const response = await axios.get(`http://162.241.149.204:3060/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('User Details:', response.data.data);
      setUserDetails(response.data.data); // Set user details fetched from the API
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details.');
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleLinkedInLogin = () => {
    window.location.href = "http://162.241.149.204:3060/auth/linkedin";
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <button onClick={handleLinkedInLogin} className="linkedin-button">
        Login with LinkedIn
      </button>

      {loading && <p>...</p>} {/* Show loading status */}

      {error && <p>{error}</p>} {/* Show error message */}

      {userDetails && (
        <div className="user-details">
          <p>Welcome, {userDetails.name} !</p>
          <p>Email: {userDetails.email}</p>
          <img src={userDetails.picture} alt="Profile" className="user-image" />
          {/* Button to navigate to the organization's posts */}
          <button onClick={() => navigate('/posts')} className="go-to-posts-button">
            Go to Organization's Posts
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
