import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Card, CardContent, styled, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  Tab, Tabs 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ComingSoonIcon from '@mui/icons-material/NewReleases';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const Upload = () => {
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleUpload = async (file) => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload only image files');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedFile = await compressImage(file);
      toast.success('Image compressed successfully');
      
      const formData = new FormData();
      formData.append('file', processedFile);
      
      const response = await api.post('/api/bills/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResponse(response.data);
      setShowSuccessDialog(true);
      toast.success('Image uploaded successfully');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file. Please try again.');
      toast.error(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      handleUpload(selectedFile);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob((blob) => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFile(file);
        handleUpload(file);
      }, 'image/jpeg', 0.8);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Error accessing camera');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const onCloseDialog = () => {
    setShowSuccessDialog(false);
    setUploadResponse(null);
  };

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Upload Document
      </Typography>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 4 }}
        centered
        variant="fullWidth"
      >
        <Tab 
          label="Expenditure" 
          icon={<CloudUploadIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Receipt" 
          icon={<ComingSoonIcon />} 
          iconPosition="start"
          disabled
        />
      </Tabs>

      {tabValue === 0 ? (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'secondary.main' : 'primary.main',
                  borderRadius: 2,
                  p: 4,
                  backgroundColor: isDragging ? 'action.hover' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      component="span"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      disabled={loading}
                    >
                      Select Expenditure Image
                    </Button>
                  </label>
                  
                  <Button
                    variant="contained"
                    startIcon={<CameraAltIcon />}
                    onClick={handleCameraCapture}
                    disabled={loading}
                  >
                    Camera
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" align="center">
                  Drag and drop your expenditure image here or use the buttons above
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Supported formats: JPG, PNG, GIF
                </Typography>
                {file && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Selected: {file.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <ComingSoonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Receipt upload functionality will be available soon!
          </Typography>
        </Card>
      )}

      <Dialog open={showSuccessDialog} onClose={onCloseDialog}>
        <DialogTitle>Upload Successful</DialogTitle>
        <DialogContent>
          <Typography>The expenditure has been successfully processed.</Typography>
          {uploadResponse && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Vendor: {uploadResponse.vendor}</Typography>
              <Typography variant="body2">Date: {new Date(uploadResponse.date).toLocaleDateString()}</Typography>
              <Typography variant="body2">Total Amount: ₹{uploadResponse.totalAmount?.toFixed(2)}</Typography>
              <Typography variant="body2">Items Processed: {uploadResponse.lineItems?.length || 0}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Upload;