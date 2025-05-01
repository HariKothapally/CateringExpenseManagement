import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Header = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#1976d2',
        zIndex: (theme) => theme.zIndex.drawer + 1 
      }}
    >
      <Toolbar>
        <RestaurantMenuIcon sx={{ mr: 2, color: '#ffffff' }} />
        <Typography variant="h6" component="div" sx={{ 
          flexGrow: 1, 
          color: '#ffffff',
          fontWeight: 500
        }}>
          Catering Expense Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;