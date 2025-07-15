import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  RotateCcw, 
  X, 
  Image as ImageIcon,
  Check,
  RefreshCw,
  Upload,
  Monitor
} from 'lucide-react';
import { useCamera } from '@/hooks/utils/useCamera';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  maxPhotos?: number;
  capturedPhotos?: string[];
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onCapture, 
  onClose, 
  maxPhotos = 5,
  capturedPhotos = []
}) => {
  const {
    isSupported,
    isStreaming,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice && hasTouch && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isSupported && isMobile) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isSupported, isMobile, startCamera, stopCamera]);

  const handleCapture = () => {
    if (capturedPhotos.length >= maxPhotos) {
      return;
    }

    setIsCapturing(true);
    const imageData = capturePhoto();
    
    if (imageData) {
      setPreviewImage(imageData);
      setShowPreview(true);
    }
    
    setIsCapturing(false);
  };

  const handleConfirmPhoto = () => {
    if (previewImage) {
      onCapture(previewImage);
      setPreviewImage(null);
      setShowPreview(false);
    }
  };

  const handleRetakePhoto = () => {
    setPreviewImage(null);
    setShowPreview(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Handle multiple files
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/') && capturedPhotos.length + index < maxPhotos) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          onCapture(imageData);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file, index) => {
      if (file.type.startsWith('image/') && capturedPhotos.length + index < maxPhotos) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          onCapture(imageData);
        };
        reader.readAsDataURL(file);
      }
    });
  };
    }
  };

  // Desktop/Non-mobile experience
  if (!isMobile || !isSupported) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {!isMobile ? (
                  <Monitor className="h-8 w-8 text-primary" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {!isMobile ? 'Desktop Photo Upload' : 'Camera Not Available'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {!isMobile 
                  ? 'Upload photos from your computer to add to your post'
                  : 'Camera access is not available on this device'
                }
              </p>
            </div>

            {!isSupported && (
              <Alert className="mb-4">
                <AlertDescription>
                  Camera access is not supported in this browser. You can still upload photos from your device.
                </AlertDescription>
              </Alert>
            )}

            {/* Drag and Drop Upload Area */}
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">Upload Photos</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop photos here, or click to browse
              </p>
              
              <label htmlFor="desktop-file-upload">
                <Button asChild className="mb-4">
                  <span>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Photos
                  </span>
                </Button>
              </label>
              
              <input
                id="desktop-file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, GIF (Max {maxPhotos} photos)
              </p>
            </div>

            {/* Current Photos Count */}
            {capturedPhotos.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  {capturedPhotos.length} of {maxPhotos} photos selected
                </p>
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: maxPhotos }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < capturedPhotos.length ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={onClose} 
                className="flex-1"
                disabled={capturedPhotos.length === 0}
              >
                Done ({capturedPhotos.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile camera error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Camera className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="font-medium mb-2">Camera Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => startCamera()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="w-full">
                <span>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload from Gallery
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile camera interface
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        <span className="text-sm">
          {capturedPhotos.length}/{maxPhotos} photos
        </span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {showPreview && previewImage ? (
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Camera overlay grid */}
        {!showPreview && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-2 border-white/20 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {showPreview ? (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetakePhoto}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button
              size="lg"
              onClick={handleConfirmPhoto}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* Gallery Upload */}
            <label htmlFor="gallery-upload">
              <Button
                variant="outline"
                size="icon"
                asChild
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-12 h-12"
              >
                <span>
                  <ImageIcon className="h-6 w-6" />
                </span>
              </Button>
            </label>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Capture Button */}
            <Button
              size="icon"
              onClick={handleCapture}
              disabled={!isStreaming || isCapturing || capturedPhotos.length >= maxPhotos}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
            >
              <Camera className="h-8 w-8" />
            </Button>

            {/* Switch Camera */}
            <Button
              variant="outline"
              size="icon"
              onClick={switchCamera}
              disabled={!isStreaming}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-12 h-12"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Photo count indicator */}
        {capturedPhotos.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {Array.from({ length: maxPhotos }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < capturedPhotos.length ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;