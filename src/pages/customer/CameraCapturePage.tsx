import React from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '@/components/features/CameraCapture';

const CameraCapturePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCapture = (imageData: string) => {
    // Pass the image back to the Home page via navigation state
    navigate('/', { state: { capturedImage: imageData } });
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <CameraCapture onCapture={handleCapture} onClose={handleClose} />
    </div>
  );
};

export default CameraCapturePage;