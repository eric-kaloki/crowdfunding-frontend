import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';

interface PaymentDialogProps {
  projectId: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  projectId, 
  amount, 
  isOpen, 
  onClose 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate Kenyan phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(254|0)\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)",
        variant: "destructive"
      });
      return;
    }

    // Ensure amount is within MPesa sandbox limits (1-1000 KES)
    const paymentAmount = Math.floor(amount); // Ensure whole number

    setIsLoading(true);

    try {
      // Format phone number to international format
      const formattedPhoneNumber = phoneNumber.startsWith('0') 
        ? `254${phoneNumber.slice(1)}` 
        : phoneNumber.startsWith('+') 
          ? phoneNumber.replace('+', '') 
          : phoneNumber;
      
      const response = await axiosInstance.post('/api/payments/initiate', {
        projectId,
        phoneNumber: formattedPhoneNumber,
        amount: paymentAmount
      });

      toast({
        title: "Payment Initiated",
        description: "Please check your phone to complete the M-PESA payment",
        variant: "default"
      });

      // Store payment details for status checking
      if (response.data.payment) {
        localStorage.setItem(`payment_${projectId}`, JSON.stringify({
          id: response.data.payment.id,
          merchant_request_id: response.data.payment.merchant_request_id,
          mpesa_checkout_request_id: response.data.payment.mpesa_checkout_request_id
        }));
      }

      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.response?.data?.error || "Unable to initiate payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>M-PESA Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
            <p className="font-medium text-lg">{formatCurrency(amount)}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">M-PESA Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter M-PESA phone number"
            />
            <p className="text-xs text-muted-foreground">
              Format: 0712345678 or 254712345678
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handlePayment}
            disabled={isLoading || !phoneNumber}
          >
            {isLoading ? "Processing..." : "Pay with M-PESA"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will receive an M-PESA prompt on your phone to complete the payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;