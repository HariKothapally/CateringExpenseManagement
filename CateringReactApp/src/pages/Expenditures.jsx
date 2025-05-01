import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, IconButton, Collapse,
  Dialog, DialogActions, DialogContent, DialogTitle, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { api } from '../services/api';
import ExpenseEditDialog from '../components/ExpenseEditDialog';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString();
  return `${weekday}, ${formattedDate}`;
};

const ExpenseRow = ({ expense, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ 
        '& > *': { borderBottom: 'unset' },
        '&:hover': { backgroundColor: '#f5f5f5' }
      }}>
        <TableCell>
          <IconButton 
            size="small" 
            onClick={() => setOpen(!open)}
            sx={{ color: '#546e7a' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: '#2c3e50' }}>{expense.vendor}</TableCell>
        <TableCell sx={{ color: '#2c3e50' }}>{formatDate(expense.date)}</TableCell>
        <TableCell sx={{ color: '#2c3e50' }}>₹{expense.totalAmount.toFixed(2)}</TableCell>
        <TableCell sx={{ color: '#2c3e50' }}>{expense.paymentMethod}</TableCell>
        <TableCell>
          <IconButton 
            color="primary"
            onClick={() => onEdit(expense)}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            sx={{ color: '#d32f2f' }}
            onClick={() => onDelete(expense)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" sx={{ color: '#2c3e50' }}>
                Line Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ color: '#2c3e50', fontWeight: 600 }}>Item Name</TableCell>
                    <TableCell sx={{ color: '#2c3e50', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ color: '#2c3e50', fontWeight: 600 }}>Unit Price</TableCell>
                    <TableCell sx={{ color: '#2c3e50', fontWeight: 600 }}>Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expense.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#2c3e50' }}>{item.itemName}</TableCell>
                      <TableCell sx={{ color: '#2c3e50' }}>{item.quantity}</TableCell>
                      <TableCell sx={{ color: '#2c3e50' }}>₹{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell sx={{ color: '#2c3e50' }}>₹{item.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Expenditures = () => {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { data: expenses, isLoading, error } = useQuery('expenses', async () => {
    const response = await api.get('/api/bills');
    return response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/bills/${selectedExpense.id}`);
      queryClient.invalidateQueries('expenses');
      setDeleteDialogOpen(false);
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Error deleting expense');
      console.error('Delete error:', error);
    }
  };

  const handleSaveEdit = async (updatedExpense) => {
    try {
      await api.put(`/api/bills/${updatedExpense.id}`, updatedExpense);
      queryClient.invalidateQueries('expenses');
      setEditDialogOpen(false);
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error('Error updating expense');
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error loading expenditures: {error.message}</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>Expenditures</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Vendor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses?.map((expense) => (
              <ExpenseRow 
                key={expense.id} 
                expense={expense} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ExpenseEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        expense={selectedExpense}
        onSave={handleSaveEdit}
      />

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
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Expenditures;