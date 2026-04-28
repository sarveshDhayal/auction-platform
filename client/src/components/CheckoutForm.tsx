import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';
import api from '../services/api';

interface CheckoutFormProps {
  auctionId: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ auctionId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!stripe) return;

    // Check URL for payment_intent_client_secret if returning from a redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case 'succeeded':
          setStatus('success');
          setMessage('Payment succeeded!');
          api.post('/payments/confirm', { paymentIntentId: paymentIntent.id }).then(onSuccess);
          break;
        case 'processing':
          setStatus('processing');
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setStatus('error');
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevent automatic redirect to keep user in SPA modal if possible
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred.');
      } else {
        setMessage('An unexpected error occurred.');
      }
      setStatus('error');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setStatus('success');
      // Tell backend to update transaction status
      await api.post('/payments/confirm', { paymentIntentId: paymentIntent.id });
      onSuccess();
    }

    setIsLoading(false);
  };

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
        <p className="text-text-secondary mb-6">Your transaction has been securely processed.</p>
        <Button onClick={onSuccess} className="w-full">View Invoice</Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <PaymentElement 
          id="payment-element" 
          options={{
            layout: 'tabs',
            // theme: 'night', // Stripe's dark theme matches our UI
            // Using appearance API instead of theme string in newer versions
          }} 
        />
      </div>

      <Button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full h-12 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        isLoading={isLoading}
      >
        Pay Now
      </Button>

      {/* Show any error or success messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {status === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {message}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
