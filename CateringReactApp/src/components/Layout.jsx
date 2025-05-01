import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Header from './Header';
import Footer from './Footer';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Typography, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadIcon from '@mui/icons-material/Upload';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Upload', icon: <UploadIcon />, path: '/upload' },
    { text: 'Expenditures', icon: <ReceiptIcon />, path: '/expenditures' },
    { text: 'Recent', icon: <HistoryIcon />, path: '/recent' },
    { text: 'Downloads', icon: <DownloadIcon />, path: '/downloads' },
  ];

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%'
    }}>
      <Header />
      <Toolbar />
      <Box sx={{ 
        display: 'flex',
        flex: 1,
        width: '100%'
      }}>
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <Navbar />
        </Box>
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}>
          <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
            <Outlet />
          </Container>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;