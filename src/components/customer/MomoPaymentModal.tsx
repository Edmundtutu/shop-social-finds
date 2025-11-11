import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { checkMomoStatus } from '@/services/momoService';
import logoUrl from '@/assets/images/momologo.jpg';

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

  const maxPollingAttempts = 30;

  useEffect(() => {
    if (!isOpen || !referenceId) return;

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await checkMomoStatus(referenceId);

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
      }, 5000);

      pollStatus();
    }

    timeoutId = setTimeout(() => {
      setIsPolling(false);
      if (status === 'pending') {
        setError('Payment verification timeout');
      }
    }, 300000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, referenceId, isPolling, pollingCount, status, toast, navigate, onPaymentComplete]);

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-12 w-12 text-white" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-white" />;
      default:
        return <Loader2 className="h-12 w-12 text-white animate-spin" />;
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'successful':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-[#FFCB05]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'successful':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Processing Payment';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-0">
        {/* MTN MoMo Header */}
        <CardHeader className={`${getStatusBgColor()} text-white p-6 transition-colors duration-300`}>
          <div className="flex flex-col items-center gap-4">
            {/* MTN MoMo Logo - Circular without white bg */}
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{getStatusText()}</h2>
              <p className="text-sm opacity-90 mt-1">
                {status === 'pending' ? 'Please complete the payment on your phone' :
                  status === 'successful' ? 'Your payment has been processed' :
                    'Transaction could not be completed'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Amount</span>
              <span className="text-xl font-bold text-gray-900">UGX {amount.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="font-semibold text-gray-900">{payerNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reference ID</span>
              <span className="font-mono text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded">
                {referenceId.slice(0, 12)}...
              </span>
            </div>
          </div>

          {/* Status Progress */}
          {status === 'pending' && isPolling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Verifying payment...</span>
                <span className="text-[#FFCB05] font-semibold">{pollingCount}/{maxPollingAttempts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#FFCB05] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(pollingCount / maxPollingAttempts) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {status === 'pending' && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-2">Complete Your Payment:</p>
                  <ol className="text-blue-800 space-y-1.5 list-decimal list-inside">
                    <li>Check your phone ({payerNumber}) for the MoMo prompt</li>
                    <li>Enter your MoMo PIN to authorize the payment</li>
                    <li>Wait for the confirmation message</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900 mb-1">Payment Error</p>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {status === 'successful' && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 mb-1">Payment Confirmed!</p>
                  <p className="text-green-800">Your transaction has been successfully completed. You will be redirected shortly.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {status === 'successful' ? (
              <Button
                className="flex-1 bg-[#FFCB05] hover:bg-[#E6B800] text-black font-semibold h-12"
                onClick={() => onPaymentComplete(true, referenceId)}
              >
                Continue
              </Button>
            ) : status === 'failed' ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#FFCB05] hover:bg-[#E6B800] text-black font-semibold h-12"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel Payment
              </Button>
            )}
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">Powered by <span className="font-semibold text-[#FFCB05]">MTN Mobile Money</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}