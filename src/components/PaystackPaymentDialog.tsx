
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCedi } from '@/lib/utils';

interface PaystackPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  customerEmail: string;
  onSuccess: (reference: string) => void;
  onError: (error: any) => void;
}

const PaystackPaymentDialog: React.FC<PaystackPaymentDialogProps> = ({
  open,
  onOpenChange,
  total,
  customerEmail,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const initializePaystackPayment = () => {
    setIsLoading(true);
    
    // Load Paystack script dynamically
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => {
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_b3a98848f055960ae6aff18a256c4e0a56b71027',
        email: customerEmail,
        amount: total * 100, // Paystack expects amount in kobo (GHS * 100)
        currency: 'GHS',
        ref: `${Date.now()}`, // Generate unique reference
        callback: function(response: any) {
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          onSuccess(response.reference);
          onOpenChange(false);
          setIsLoading(false);
        },
        onClose: function() {
          console.log('Payment window closed');
          setIsLoading(false);
          toast.info('Payment cancelled');
        }
      });
      handler.openIframe();
    };
    script.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to load payment system');
      onError(new Error('Failed to load Paystack'));
    };
    document.body.appendChild(script);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-brand-orange" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-orange mb-2">
              {formatCedi(total)}
            </div>
            <p className="text-gray-600">Amount to pay</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Payment will be processed securely by Paystack</p>
            <p className="text-sm font-medium">Email: {customerEmail}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Accepted payment methods:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Visa, Mastercard, Verve cards</li>
              <li>• Bank transfers</li>
              <li>• Mobile money</li>
              <li>• USSD</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={initializePaystackPayment}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaystackPaymentDialog;
