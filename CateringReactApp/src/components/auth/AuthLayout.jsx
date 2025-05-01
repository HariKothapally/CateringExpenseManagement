import { Box, Paper, Container } from '@mui/material';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}