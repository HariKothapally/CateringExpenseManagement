import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}