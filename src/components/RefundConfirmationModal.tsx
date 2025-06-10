import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Clock, CheckCircle } from "lucide-react";

interface RefundConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  contribution: {
    id: string;
    amount: number;
    payment_method: string;
    transaction_id?: string;
    contributor: {
      name: string;
      email: string;
    };
    campaign: {
      title: string;
    };
  } | null;
  isProcessing: boolean;
}

const RefundConfirmationModal: React.FC<RefundConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contribution,
  isProcessing
}) => {
  const [refundReason, setRefundReason] = useState('');

  const handleConfirm = () => {
    if (refundReason.trim()) {
      onConfirm(refundReason.trim());
      setRefundReason('');
    }
  };

  const handleClose = () => {
    setRefundReason('');
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const isMpesaPayment = contribution?.payment_method === 'mpesa' && contribution?.transaction_id;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Refund
          </DialogTitle>
        </DialogHeader>

        {contribution && (
          <div className="space-y-4">
            {/* Refund Details */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{contribution.contributor.name}</h4>
                  <p className="text-sm text-gray-600">{contribution.contributor.email}</p>
                  <p className="text-sm text-gray-500">Campaign: {contribution.campaign.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatCurrency(contribution.amount)}</p>
                  <Badge variant="outline" className="text-xs">
                    {contribution.payment_method.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {contribution.transaction_id && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Transaction ID: {contribution.transaction_id}
                  </p>
                </div>
              )}
            </div>

            {/* Refund Method Info */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              {isMpesaPayment ? (
                <>
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">M-Pesa Automatic Reversal</h5>
                    <p className="text-sm text-blue-700">
                      This will initiate an automatic M-Pesa reversal. The refund will be processed directly to the contributor's mobile money account.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-900">Manual Refund Required</h5>
                    <p className="text-sm text-amber-700">
                      This payment will be marked as refunded. You'll need to process the actual refund manually.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label htmlFor="refundReason">Refund Reason *</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund..."
                className="min-h-[80px]"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500">
                This reason will be recorded and may be shared with the contributor.
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This action cannot be undone. The contribution amount will be deducted from the campaign's funding.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!refundReason.trim() || isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {isMpesaPayment ? 'Processing Reversal...' : 'Processing Refund...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundConfirmationModal;
