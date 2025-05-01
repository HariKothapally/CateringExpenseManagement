import { TextField } from '@mui/material';

export default function FormField({ error, ...props }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      margin="normal"
      error={!!error}
      helperText={error}
      {...props}
    />
  );
}