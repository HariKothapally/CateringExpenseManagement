import { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { FormField, LoadingButton } from '../common';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.forgotPassword({ email });
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Reset Password
      </Typography>
      <FormField
        name="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <LoadingButton
        type="submit"
        variant="contained"
        fullWidth
        loading={isLoading}
        sx={{ mt: 2 }}
      >
        Send Reset Instructions
      </LoadingButton>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={onBack}
        >
          Back to Login
        </Link>
      </Box>
    </Box>
  );
}