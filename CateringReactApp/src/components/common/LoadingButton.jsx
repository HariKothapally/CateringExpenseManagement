import { Button, CircularProgress } from '@mui/material';

export default function LoadingButton({ loading, children, ...props }) {
  return (
    <Button
      disabled={loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} /> : children}
    </Button>
  );
}