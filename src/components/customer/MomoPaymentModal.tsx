import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { checkMomoStatus } from '@/services/momoService';

interface MomoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (success: boolean, referenceId?: string) => void;
  referenceId: string;
  amount: number;
  payerNumber: string;
}

export default function MomoPaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  referenceId, 
  amount, 
  payerNumber 
}: MomoPaymentModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'successful' | 'failed'>('pending');
  const [isPolling, setIsPolling] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const maxPollingAttempts = 30; // 30 attempts * 5 seconds = 2.5 minutes

  useEffect(() => {
    if (!isOpen || !referenceId) return;

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await checkMomoStatus(referenceId);
        
        // Check if response exists and has the expected structure
        if (!response || typeof response !== 'object') {
          console.warn('Invalid response from MoMo status check:', response);
          if (pollingCount >= maxPollingAttempts) {
            setIsPolling(false);
            setError('Unable to verify payment status - invalid response');
          }
          return;
        }

        const status = response.status || 'pending';
        setStatus(status);
        setRawResponse(response.raw || response);

        if (status === 'successful') {
          setIsPolling(false);
          toast({
            title: 'Payment successful!',
            description: 'Your MoMo payment has been confirmed.',
          });
          setTimeout(() => {
            onPaymentComplete(true, referenceId);
            navigate('/profile');
          }, 2000);
        } else if (status === 'failed') {
          setIsPolling(false);
          setError(response.reason || 'Payment failed');
          toast({
            title: 'Payment failed',
            description: response.reason || 'MoMo payment was not completed. Please try again.',
            variant: 'destructive',
          });
        } else if (pollingCount >= maxPollingAttempts) {
          setIsPolling(false);
          setError('Payment timeout - please check your MoMo account or try again');
          toast({
            title: 'Payment timeout',
            description: 'Payment is taking longer than expected. Please check your MoMo account.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Error checking MoMo status:', err);
        if (pollingCount >= maxPollingAttempts) {
          setIsPolling(false);
          setError('Unable to verify payment status - network error');
        }
      }
    };

    if (isPolling) {
      intervalId = setInterval(() => {
        setPollingCount(prev => {
          const newCount = prev + 1;
          if (newCount >= maxPollingAttempts) {
            setIsPolling(false);
            return newCount;
          }
          pollStatus();
          return newCount;
        });
      }, 5000); // Poll every 5 seconds

      // Initial poll
      pollStatus();
    }

    // Timeout after 5 minutes
    timeoutId = setTimeout(() => {
      setIsPolling(false);
      if (status === 'pending') {
        setError('Payment verification timeout');
      }
    }, 300000); // 5 minutes

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, referenceId, isPolling, pollingCount, status, toast, navigate, onPaymentComplete]);

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'successful':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'successful':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Awaiting Payment';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>MTN MoMo Payment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete payment on your mobile device
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">UGX {amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone:</span>
              <span className="font-medium">{payerNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Reference:</span>
              <span className="font-mono text-xs">{referenceId.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Status Display */}
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium">{getStatusText()}</p>
                {isPolling && status === 'pending' && (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <p className="text-xs text-muted-foreground">
                      Checking payment status... ({pollingCount}/{maxPollingAttempts})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          {status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Payment Instructions:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Check your phone for a MoMo prompt</li>
                    <li>Enter your MoMo PIN to confirm payment</li>
                    <li>Wait for confirmation (this may take a few moments)</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">Payment Error:</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {status === 'successful' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 mb-1">Payment Confirmed!</p>
                  <p className="text-green-700">Your order has been successfully paid for.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === 'successful' ? (
              <Button className="flex-1" onClick={() => onPaymentComplete(true, referenceId)}>
                Continue
              </Button>
            ) : status === 'failed' ? (
              <>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </>
            ) : (
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
