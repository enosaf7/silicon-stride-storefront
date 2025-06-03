
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatCedi } from '@/lib/utils';

interface MoMoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: () => void;
}

const MoMoPaymentDialog: React.FC<MoMoPaymentDialogProps> = ({
  open,
  onOpenChange,
  total,
  onConfirm
}) => {
  const adminPhoneNumber = "0596760174";

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(adminPhoneNumber);
    toast.success("Phone number copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5 text-brand-orange" />
            Mobile Money Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-orange mb-2">
              {formatCedi(total)}
            </div>
            <p className="text-gray-600">Amount to send</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Send money to:</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{adminPhoneNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPhoneNumber}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Steps to complete payment:</h4>
            <ol className="text-sm space-y-2">
              <li className="flex items-start">
                <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                Dial *170# on your phone
              </li>
              <li className="flex items-start">
                <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                Select "Transfer Money"
              </li>
              <li className="flex items-start">
                <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                Send {formatCedi(total)} to {adminPhoneNumber}
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              After sending the money, click "I've Sent the Money" below. 
              You'll receive an OTP to complete your order once the admin confirms payment.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
            >
              I've Sent the Money
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoMoPaymentDialog;
