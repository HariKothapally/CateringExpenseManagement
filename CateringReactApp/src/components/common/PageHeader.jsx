import { Box, Typography, Button } from '@mui/material';

export default function PageHeader({ title, action }) {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h5">{title}</Typography>
      {action}
    </Box>
  );
}