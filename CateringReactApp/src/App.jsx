import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Downloads from './pages/Downloads';
import Expenditures from './pages/Expenditures';
import ProtectedRoute from './components/ProtectedRoute';
import Receipts from './pages/Receipts';
import Recent from './pages/Recent';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="expenditures" element={<Expenditures />} />
                  <Route path="recent" element={<Recent />} />
                  <Route path="receipts" element={<Receipts />} />
                  <Route path="upload" element={<Upload />} />
                  <Route path="downloads" element={<Downloads />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ThemeProvider>
          </LocalizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;