import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  RotateCcw, 
  X, 
  Image as ImageIcon,
  Check,
  RefreshCw
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

  useEffect(() => {
    if (isSupported) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isSupported, startCamera, stopCamera]);

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
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Camera not supported</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your browser doesn't support camera access
          </p>
          <div className="space-y-2">
            <label htmlFor="file-upload">
              <Button asChild className="w-full">
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
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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