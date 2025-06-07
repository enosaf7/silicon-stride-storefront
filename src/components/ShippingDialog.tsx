
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ShippingForm from './ShippingForm';

interface ShippingData {
  deliveryType: 'delivery' | 'pickup';
  fullName: string;
  phone: string;
  address: string;
  gpsAddress: string;
  coordinates: [number, number] | null;
  shippingFee: number;
  region: string;
}

interface ShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShippingData) => void;
  isSubmitting?: boolean;
}

const ShippingDialog: React.FC<ShippingDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shipping & Delivery Information</DialogTitle>
        </DialogHeader>
        
        <ShippingForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShippingDialog;
