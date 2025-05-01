import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const Downloads = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterType, setFilterType] = useState('custom');
  const [loading, setLoading] = useState(false);

  const { data: expenses, isLoading: fetchingData } = useQuery('expenses', async () => {
    const response = await api.get('/api/bills');
    return response.data;
  });

  const filterExpenses = (expenses) => {
    if (!expenses) return [];
    
    return expenses.filter(expense => {
      const expenseDate = dayjs(expense.date);
      
      if (filterType === 'custom') {
        if (!startDate || !endDate) return false;
        return expenseDate.isAfter(startDate) && expenseDate.isBefore(endDate);
      }

      const now = dayjs();
      switch (filterType) {
        case 'thisMonth':
          return expenseDate.isAfter(now.startOf('month')) && 
                 expenseDate.isBefore(now.endOf('month'));
        case 'lastMonth':
          return expenseDate.isAfter(now.subtract(1, 'month').startOf('month')) && 
                 expenseDate.isBefore(now.subtract(1, 'month').endOf('month'));
        case 'thisYear':
          return expenseDate.isAfter(now.startOf('year')) && 
                 expenseDate.isBefore(now.endOf('year'));
        case 'lastYear':
          return expenseDate.isAfter(now.subtract(1, 'year').startOf('year')) && 
                 expenseDate.isBefore(now.endOf('year'));
        default:
          return true;
      }
    });
  };

  const handleDownload = () => {
    setLoading(true);
    try {
      const filteredExpenses = filterExpenses(expenses);
      
      if (filteredExpenses.length === 0) {
        toast.error('No expenses found for the selected period');
        return;
      }

      // Prepare data for Excel with inline items
      const excelData = [];
      filteredExpenses.forEach(expense => {
        // Add main expense row
        excelData.push({
          Date: new Date(expense.date).toLocaleDateString(),
          Vendor: expense.vendor,
          'Total Amount': expense.totalAmount.toFixed(2),
          'Payment Method': expense.paymentMethod,
          'Items Count': expense.lineItems?.length || 0,
          'Item Name': '',
          'Quantity': '',
          'Unit Price': '',
          'Item Total': ''
        });

        // Add line items
        expense.lineItems?.forEach(item => {
          excelData.push({
            Date: '',
            Vendor: '',
            'Total Amount': '',
            'Payment Method': '',
            'Items Count': '',
            'Item Name': item.itemName,
            'Quantity': item.quantity,
            'Unit Price': item.unitPrice.toFixed(2),
            'Item Total': item.totalPrice.toFixed(2)
          });
        });

        // Add empty row for separation
        excelData.push({
          Date: '',
          Vendor: '',
          'Total Amount': '',
          'Payment Method': '',
          'Items Count': '',
          'Item Name': '',
          'Quantity': '',
          'Unit Price': '',
          'Item Total': ''
        });
      });

      // Create worksheet with styling
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 20 }, // Vendor
        { wch: 15 }, // Total Amount
        { wch: 15 }, // Payment Method
        { wch: 10 }, // Items Count
        { wch: 30 }, // Item Name
        { wch: 10 }, // Quantity
        { wch: 12 }, // Unit Price
        { wch: 12 }, // Item Total
      ];
      ws['!cols'] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

      // Generate Excel file
      const fileName = `expenses_${filterType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Error creating Excel file');
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterTypeChange = (event) => {
    const type = event.target.value;
    setFilterType(type);
    
    const now = dayjs();
    if (type === 'thisMonth') {
      setStartDate(now.startOf('month'));
      setEndDate(now.endOf('month'));
    } else if (type === 'lastMonth') {
      setStartDate(now.subtract(1, 'month').startOf('month'));
      setEndDate(now.subtract(1, 'month').endOf('month'));
    } else if (type === 'thisYear') {
      setStartDate(now.startOf('year'));
      setEndDate(now.endOf('year'));
    } else if (type === 'lastYear') {
      setStartDate(now.subtract(1, 'year').startOf('year'));
      setEndDate(now.endOf('year'));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Download Expenses
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filter Type"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <MenuItem value="custom">Custom Date Range</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="thisYear">This Year</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
            </TextField>
          </Grid>

          {filterType === 'custom' && (
            <>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={startDate}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={loading || fetchingData ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={loading || fetchingData || (filterType === 'custom' && (!startDate || !endDate))}
            >
              Download Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Downloads;