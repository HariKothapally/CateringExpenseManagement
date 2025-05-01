import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{
        width: '100%',
        py: 2,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        mt: 'auto',
        position: 'relative',
        left: 0,
        bottom: 0,
        zIndex: 1
      }}
    >
      <Typography 
        variant="body2" 
        align="center"
        sx={{ 
          color: '#546e7a',
          fontWeight: 500
        }}
      >
        © {new Date().getFullYear()} Catering Expense Management. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;