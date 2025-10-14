import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  url: string;
  onPaymentComplete?: (success: boolean, txRef?: string) => void; // Optional callback for parent
}

export default function PaymentModal({ url, onPaymentComplete }: PaymentModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const handlePaymentSuccess = (txRef?: string) => {
    toast({
      title: 'Payment successful!',
      description: 'Your order has been confirmed.',
    });
    navigate('/profile');
    onPaymentComplete?.(true, txRef);
  };

  const handlePaymentFailure = (txRef?: string) => {
    toast({
      title: 'Payment failed',
      description: 'Payment was not completed. Please try again.',
      variant: 'destructive',
    });
    onPaymentComplete?.(false, txRef);
  };

  useEffect(() => {
    setIsMounted(true);
    
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from Flutterwave domains for payment callbacks
      const allowedOrigins = [
        window.location.origin,
        'https://checkout.flutterwave.com',
        'https://api.flutterwave.com'
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Rejected message from origin:', event.origin);
        return;
      }
      
      // Only handle messages after component is fully mounted
      if (!isMounted) return;

      console.log('Received message:', event.data);

      // Handle Flutterwave payment completion
      if (event.data.type === 'PAYMENT_SUCCESS' || event.data.status === 'successful') {
        console.log('Payment success message received');
        handlePaymentSuccess(event.data.txRef || event.data.tx_ref);
      } else if (event.data.type === 'PAYMENT_FAILED' || event.data.status === 'failed') {
        console.log('Payment failed message received');
        handlePaymentFailure(event.data.txRef || event.data.tx_ref);
      } else if (event.data.status === 'cancelled') {
        console.log('Payment cancelled message received');
        handlePaymentFailure(event.data.txRef || event.data.tx_ref);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isMounted, toast, navigate, onPaymentComplete]);

  if (!url) {
    console.log('No URL provided to PayModal');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] h-[90%] rounded-2xl overflow-hidden relative">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading payment...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="Payment"
          onLoad={() => {
            setIsLoading(false);
            console.log('Payment iframe loaded');
          }}
          onError={(e) => {
            console.error('Payment iframe error:', e);
            setIsLoading(false);
            handlePaymentFailure();
          }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-modals"
          allow="payment; microphone; camera"
        />
      </div>
    </div>
  );
}
