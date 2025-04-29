import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // State uses 'username' and 'password'
  const [formData, setFormData] = useState({ username: '', password: '' });
  // Only keep server error state, remove client-side validation errors
  const [errors, setErrors] = useState({ server: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Remove validateEmail and validatePassword functions

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Remove real-time validation logic
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Reset only the server error
    setErrors({ server: '' });

    // Remove client-side validation checks before submitting
    // const emailError = validateEmail(formData.email); // Removed
    // const passwordError = validatePassword(formData.password); // Removed
    // if (emailError || passwordError) { // Removed block
    //   setErrors({ ...errors, email: emailError, password: passwordError });
    //   setLoading(false);
    //   return;
    // }

    try {
      // Send formData which contains { username: '...', password: '...' }
      // Ensure your backend API '/api/auth/login' expects 'username' and 'password'
      const response = await axios.post('/api/auth/login', formData);
      // Assuming the backend returns a token upon successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard'); // Navigate to dashboard or desired route
      } else {
        // Handle cases where login is successful but no token is returned (if applicable)
        setErrors({ server: 'Login successful, but no token received.' });
      }
    } catch (err) {
      // Display error message from the server response, or a generic one
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your username and password.';
      setErrors({ server: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="username" // Keep name as "username"
          label="Username" // Change label to "Username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          // Remove error and helperText props related to client-side validation
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          // Remove error and helperText props related to client-side validation
        />
        {/* Display only server-side errors */}
        {errors.server && (
          <Typography color="error" variant="body2" gutterBottom style={{ marginTop: '10px' }}>
            {errors.server}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          // Disable button only when loading
          disabled={loading}
          style={{ marginTop: '20px' }} // Added some margin for better spacing
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Container>
  );
};

export default Login;
