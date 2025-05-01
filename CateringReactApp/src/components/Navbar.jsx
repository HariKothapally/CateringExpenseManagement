import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Recent', path: '/recent', icon: <HistoryIcon /> },
    { text: 'Expenditures', path: '/expenditures', icon: <ReceiptIcon /> },
    { text: 'Receipts', path: '/receipts', icon: <DescriptionIcon /> },
    { text: 'Upload', path: '/upload', icon: <UploadFileIcon /> },
    { text: 'Downloads', path: '/downloads', icon: <DownloadIcon /> }
  ];

  return (
    <Box sx={{ 
      width: 240,
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            component={Link} 
            to={item.path}
            sx={{
              color: location.pathname === item.path ? '#1976d2' : '#2c3e50',
              backgroundColor: location.pathname === item.path ? '#e3f2fd' : 'transparent',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                color: '#1976d2'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? '#1976d2' : '#546e7a'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                sx: { fontWeight: location.pathname === item.path ? 600 : 400 }
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', mt: 'auto' }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={logout}
          variant="outlined"
          sx={{
            color: '#d32f2f',
            borderColor: '#d32f2f',
            '&:hover': {
              borderColor: '#b71c1c',
              backgroundColor: 'rgba(211, 47, 47, 0.04)'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;