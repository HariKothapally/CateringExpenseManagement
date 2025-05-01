import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { api } from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          backgroundColor: `${color}.light`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h6" 
          sx={{ ml: 2, color: 'text.primary', fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: color.main, fontWeight: 600 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: expenses, isLoading, error } = useQuery('expenses', async () => {
    const response = await api.get('/api/bills');
    return response.data;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading dashboard data: {error.message}
      </Alert>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const averageExpense = totalExpenses / (expenses.length || 1);
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const monthlyTotals = expenses.reduce((acc, exp) => {
    const month = new Date(exp.date).getMonth();
    acc[month] = (acc[month] || 0) + exp.totalAmount;
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toFixed(2)}`}
            icon={<AttachMoneyIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Average Expense"
            value={`₹${averageExpense.toFixed(2)}`}
            icon={<ShoppingCartIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Bills"
            value={expenses.length}
            icon={<ReceiptIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses
            </Typography>
            <Box sx={{ 
              height: 300,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              pt: 2 
            }}>
              {Object.entries(monthlyTotals).map(([month, total]) => (
                <Box key={month} sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 40,
                    backgroundColor: 'primary.main',
                    height: `${(total / totalExpenses) * 200}px`,
                    minHeight: 20,
                    borderRadius: '4px 4px 0 0'
                  }} />
                  <Typography variant="caption">
                    {new Date(2024, month).toLocaleString('default', { month: 'short' })}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {recentExpenses.map((expense, index) => (
                <React.Fragment key={expense.id}>
                  <ListItem>
                    <ListItemText
                      primary={expense.vendor}
                      secondary={new Date(expense.date).toLocaleDateString()}
                    />
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                      ₹{expense.totalAmount.toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < recentExpenses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;