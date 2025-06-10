import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card';
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

interface PaymentData {
  campaignId: string;
  amount: number;
  method: string;
  phoneNumber?: string;
  anonymous: boolean;
  notes?: string;
}

const Payments = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    campaignId: campaignId || '',
    amount: 0,
    method: 'mpesa',
    anonymous: false
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      type: 'mpesa',
      label: 'M-Pesa',
      icon: <Smartphone className="h-5 w-5" />,
      available: true
    },
    {
      id: 'card',
      type: 'card', 
      label: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      available: false // Disabled for now
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!campaignId) {
      toast({
        title: "Error",
        description: "No campaign specified for payment",
        variant: "destructive"
      });
      navigate('/client-dashboard');
      return;
    }
  }, [isAuthenticated, campaignId, navigate]);

  const handlePayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (paymentData.method === 'mpesa' && !paymentData.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(`/campaigns/${campaignId}/contribute`, {
        amount: paymentData.amount,
        method: paymentData.method,
        phoneNumber: paymentData.phoneNumber,
        anonymous: paymentData.anonymous,
        notes: paymentData.notes
      });

      toast({
        title: "Payment Initiated",
        description: "Please complete the payment on your phone",
      });

      // Redirect back to campaign page
      navigate(`/campaigns/${campaignId}`);

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.response?.data?.error || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/campaigns/${campaignId}`)}
            className="mb-4"
          >
            ← Back to Campaign
          </Button>
          <h1 className="text-2xl font-bold">Complete Your Contribution</h1>
          <p className="text-muted-foreground">
            Choose your payment method and complete your contribution
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Contribution Amount (KES)
              </label>
              <Input
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Enter amount"
                min="1"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Payment Method
              </label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentData.method === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => method.available && setPaymentData(prev => ({ 
                      ...prev, 
                      method: method.id 
                    }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {method.icon}
                        <span className="font-medium">{method.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.available && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                        {method.available && paymentData.method === method.id && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* M-Pesa Phone Number */}
            {paymentData.method === 'mpesa' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  M-Pesa Phone Number
                </label>
                <Input
                  type="tel"
                  value={paymentData.phoneNumber || ''}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    phoneNumber: e.target.value 
                  }))}
                  placeholder="e.g. 0712345678"
                />
              </div>
            )}

            {/* Optional Note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message (Optional)
              </label>
              <Input
                value={paymentData.notes || ''}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Add a message of support..."
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={paymentData.anonymous}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  anonymous: e.target.checked 
                }))}
              />
              <label htmlFor="anonymous" className="text-sm">
                Contribute anonymously
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePayment}
              disabled={loading || !paymentData.amount}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing..." : `Contribute KES ${paymentData.amount.toLocaleString()}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;