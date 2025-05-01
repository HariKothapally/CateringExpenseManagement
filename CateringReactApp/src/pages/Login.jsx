import { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(credentials);
      // Navigation is handled in AuthContext
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}
          >
            Sign in
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, width: '100%' }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !credentials.username || !credentials.password}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
