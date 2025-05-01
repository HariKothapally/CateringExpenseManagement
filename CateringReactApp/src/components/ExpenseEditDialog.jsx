import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ExpenseEditDialog = ({ open, onClose, expense, onSave }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    date: '',
    paymentMethod: '',
    totalAmount: 0,
    lineItems: []
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        vendor: expense.vendor || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
        paymentMethod: expense.paymentMethod || '',
        totalAmount: expense.totalAmount || 0,
        lineItems: expense.lineItems?.map(item => ({
          itemName: item.itemName || '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          totalPrice: Number(item.totalPrice) || 0
        })) || []
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const updateTotalAmount = (lineItems) => {
    const total = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) : value,
      totalPrice: field === 'quantity' ? value * newLineItems[index].unitPrice :
                 field === 'unitPrice' ? value * newLineItems[index].quantity :
                 newLineItems[index].totalPrice
    };
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
    updateTotalAmount(newLineItems);
  };

  const handleDeleteLineItem = (index) => {
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      lineItems: newLineItems
    }));
    updateTotalAmount(newLineItems);
  };

  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      } ]
    }));
  };

  const handleSubmit = () => {
    const updatedExpense = {
      ...expense,
      vendor: formData.vendor,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      totalAmount: formData.totalAmount,
      lineItems: formData.lineItems.map(item => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    };
    
    onSave(updatedExpense);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2, my: 2 }}>
          <TextField
            label="Vendor"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Total Amount"
              value={formData.totalAmount.toFixed(2)}
              InputProps={{
                readOnly: true,
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
              }}
              sx={{ width: 200 }}
            />
          </Box>

          <Typography variant="h6" sx={{ mt: 2 }}>Line Items</Typography>
          {formData.lineItems.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Item Name"
                value={item.itemName}
                onChange={(e) => handleLineItemChange(index, 'itemName', e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Quantity"
                type="number"
                inputProps={{ 
                  step: "0.01",
                  inputMode: 'numeric',
                  style: { appearance: 'textfield' }
                }}
                value={Number(item.quantity).toString()}
                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                size="small"
                sx={{ 
                  width: 120,
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0
                  }
                }}
              />
              <TextField
                label="Unit Price"
                type="number"
                inputProps={{ 
                  step: "0.01",
                  inputMode: 'numeric',
                  style: { appearance: 'textfield' }
                }}
                value={Number(item.unitPrice).toString()}
                onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                size="small"
                sx={{ 
                  width: 120,
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0
                  }
                }}
              />
              <Typography sx={{ minWidth: 100 }}>
                ₹{item.totalPrice.toFixed(2)}
              </Typography>
              <IconButton 
                color="error" 
                onClick={() => handleDeleteLineItem(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddLineItem}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Line Item
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseEditDialog;