import React from 'react';
import { Paper, Typography } from '@mui/material';
import ComingSoonIcon from '@mui/icons-material/NewReleases';

const Receipts = () => {
  return (
    <Paper 
      sx={{ 
        p: 6, 
        textAlign: 'center',
        backgroundColor: '#ffffff'
      }}
    >
      <ComingSoonIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
      <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
        Coming Soon
      </Typography>
      <Typography variant="body1" sx={{ color: '#546e7a', mb: 2 }}>
        We're working on bringing you a better way to manage your receipts.
      </Typography>
      <Typography variant="body2" sx={{ color: '#546e7a' }}>
        This feature will be available in the next update.
      </Typography>
    </Paper>
  );
};

export default Receipts;