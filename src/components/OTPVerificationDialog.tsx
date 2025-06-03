
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => void;
  isVerifying: boolean;
}

const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  open,
  onOpenChange,
  onVerify,
  isVerifying
}) => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    onVerify(otp);
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-brand-orange" />
            Verify Your Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Confirmed!</h3>
            <p className="text-gray-600 text-sm">
              The admin has confirmed your payment. Enter the verification code sent to complete your order.
            </p>
          </div>
          
          <div className="space-y-3">
            <label htmlFor="otp" className="block text-sm font-medium">
              Enter 6-digit verification code:
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              placeholder="000000"
              className="text-center text-xl tracking-widest"
              maxLength={6}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationDialog;
