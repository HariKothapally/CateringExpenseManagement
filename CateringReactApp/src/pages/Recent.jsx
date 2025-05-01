import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Alert,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../services/api';
import ExpenseEditDialog from '../components/ExpenseEditDialog';
import toast from 'react-hot-toast';

const Recent = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { data: expenses = [], isLoading, error } = useQuery('expenses', async () => {
    const response = await api.get('/api/bills');
    return response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, expenses.length - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/bills/${selectedExpense.id}`);
      setDeleteDialogOpen(false);
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries('expenses');
      if (currentIndex >= expenses.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    } catch (error) {
      toast.error('Error deleting expense');
      console.error('Error:', error);
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedExpense) => {
    try {
      await api.put(`/api/bills/${updatedExpense.id}`, updatedExpense);
      queryClient.invalidateQueries('expenses');
      setEditDialogOpen(false);
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error('Error updating expense');
      console.error('Error:', error);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!expenses.length) return <Alert severity="info">No recent expenses found</Alert>;

  const currentExpense = expenses[currentIndex];

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h4">Recent Expenses</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            startIcon={<KeyboardArrowLeft />}
            size="small"
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ mx: 1 }}>
            {currentIndex + 1} of {expenses.length}
          </Typography>
          <Button
            onClick={handleNext}
            disabled={currentIndex === expenses.length - 1}
            endIcon={<KeyboardArrowRight />}
            size="small"
          >
            Next
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ position: 'relative' }}>
        <Card 
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            bgcolor: '#fff',
            borderRadius: 2,
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton 
                color="primary" 
                sx={{ mr: 1 }}
                onClick={() => handleEdit(currentExpense)}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="error"
                onClick={() => {
                  setSelectedExpense(currentExpense);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom color="primary">
                  {currentExpense.vendor}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DetailItem 
                  label="Date" 
                  value={new Date(currentExpense.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} 
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DetailItem 
                  label="Payment Method" 
                  value={currentExpense.paymentMethod} 
                />
              </Grid>
              
              <Grid item xs={12}>
                <DetailItem 
                  label="Total Amount" 
                  value={`₹${Number(currentExpense.totalAmount).toFixed(2)}`}
                  large 
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Line Items
                </Typography>
                <Box sx={{ bgcolor: '#f8f9fa', p: 1, borderRadius: 1 }}>
                  {currentExpense.lineItems.map((item, index) => (
                    <Box
                      key={index} 
                      sx={{ 
                        py: 0.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: index !== currentExpense.lineItems.length - 1 ? '1px solid #e0e0e0' : 'none'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.itemName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {Number(item.quantity).toString()} ×
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                            bgcolor: '#e3f2fd',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'primary.light'
                          }}>
                            ₹{Number(item.unitPrice).toString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" color="primary" fontWeight={500}>
                        ₹{item.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this expense from {selectedExpense?.vendor}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <ExpenseEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        expense={selectedExpense}
        onSave={handleSaveEdit}
      />
    </Box>
  );
};

const DetailItem = ({ label, value, large }) => (
  <Box>
    <Typography 
      variant="caption" 
      color="text.secondary" 
      display="block"
    >
      {label}
    </Typography>
    <Typography 
      variant={large ? "h6" : "body1"} 
      color={large ? "primary" : "text.primary"}
    >
      {value}
    </Typography>
  </Box>
);

export default Recent;