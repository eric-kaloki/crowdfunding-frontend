// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { TopAppBar } from "@/components/TopAppBar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useAuth } from '@/contexts/AuthContext';
// import axiosInstance from '@/utils/axiosConfig';
// import { toast } from "@/components/ui/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";
// import { 
//   DollarSign, 
//   Users, 
//   Target, 
//   Calendar,
//   Search,
//   Filter,
//   Download,
//   Eye,
//   RefreshCw,
//   TrendingUp,
//   CreditCard,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Clock
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface Payment {
//   id: string;
//   amount: number;
//   status: 'pending' | 'completed' | 'failed' | 'refunded';
//   payment_method: string;
//   transaction_id?: string;
//   mpesa_phone_number?: string;
//   created_at: string;
//   processed_at?: string;
//   result_desc?: string;
//   campaign?: {
//     id: string;
//     title: string;
//     creator_id?: string;
//     creator?: {
//       id: string;
//       name: string;
//       organization_name?: string;
//     };
//   };
//   contributor?: {
//     id: string;
//     name: string;
//     email: string;
//   };
// }

// interface PaymentStats {
//   totalAmount: number;
//   totalCount: number;
//   successfulPayments: number;
//   failedPayments: number;
//   pendingPayments: number;
//   averageAmount: number;
//   monthlyGrowth: number;
//   todayAmount: number;
// }

// const AdminPayments = () => {
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useAuth();
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<PaymentStats>({
//     totalAmount: 0,
//     totalCount: 0,
//     successfulPayments: 0,
//     failedPayments: 0,
//     pendingPayments: 0,
//     averageAmount: 0,
//     monthlyGrowth: 0,
//     todayAmount: 0
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [dateFilter, setDateFilter] = useState<string>('all');
//   const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
//   const [detailsModalOpen, setDetailsModalOpen] = useState(false);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/login');
//       return;
//     }

//     if (user?.role !== 'admin') {
//       navigate('/client-dashboard');
//       return;
//     }

//     fetchPayments();
//   }, [isAuthenticated, navigate, user]);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get('/admin/payments');
//       console.dir(response.data, { depth: null }); // Log full response for debugging
//       const { payments: paymentsData, stats: statsData } = response.data;
      
//       // Safely set payments with fallback
//       setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
//       // Safely set stats with proper fallbacks
//       if (statsData && typeof statsData === 'object') {
//         setStats({
//           totalAmount: Number(statsData.totalAmount) || 0,
//           totalCount: Number(statsData.totalCount) || 0,
//           successfulPayments: Number(statsData.successfulPayments) || 0,
//           failedPayments: Number(statsData.failedPayments) || 0,
//           pendingPayments: Number(statsData.pendingPayments) || 0,
//           averageAmount: Number(statsData.averageAmount) || 0,
//           monthlyGrowth: Number(statsData.monthlyGrowth) || 0,
//           todayAmount: Number(statsData.todayAmount) || 0
//         });
//       } else {
//         console.warn('Stats data not received or invalid format:', statsData);
//       }
//     } catch (error: any) {
//       console.error('Error fetching payments:', error);
//       toast({
//         title: "Error",
//         description: error.response?.data?.error || "Failed to load payments",
//         variant: "destructive",
//       });
      
//       // Reset to empty state on error
//       setPayments([]);
//       setStats({
//         totalAmount: 0,
//         totalCount: 0,
//         successfulPayments: 0,
//         failedPayments: 0,
//         pendingPayments: 0,
//         averageAmount: 0,
//         monthlyGrowth: 0,
//         todayAmount: 0
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefundPayment = async (paymentId: string) => {
//     try {
//       await axiosInstance.post(`/admin/payments/${paymentId}/refund`);
      
//       setPayments(prev => prev.map(payment => 
//         payment.id === paymentId 
//           ? { ...payment, status: 'refunded' as const }
//           : payment
//       ));

//       toast({
//         title: "Refund Processed",
//         description: "The payment has been refunded successfully.",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.error || "Failed to process refund",
//         variant: "destructive",
//       });
//     }
//   };

//   const exportPayments = async () => {
//     try {
//       const response = await axiosInstance.get('/admin/payments/export', {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
      
//       toast({
//         title: "Export Complete",
//         description: "Payments data has been exported successfully.",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.response?.data?.error || "Failed to export payments",
//         variant: "destructive",
//       });
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-KE', {
//       style: 'currency',
//       currency: 'KES'
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="h-4 w-4 text-green-600" />;
//       case 'failed':
//         return <XCircle className="h-4 w-4 text-red-600" />;
//       case 'pending':
//         return <Clock className="h-4 w-4 text-yellow-600" />;
//       case 'refunded':
//         return <RefreshCw className="h-4 w-4 text-blue-600" />;
//       default:
//         return <AlertCircle className="h-4 w-4 text-gray-600" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'failed':
//         return 'bg-red-100 text-red-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'refunded':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const filteredPayments = payments.filter(payment => {
//     // Add null checks to prevent errors
//     const contributorName = payment.contributor?.name || '';
//     const campaignTitle = payment.campaign?.title || '';
//     const transactionId = payment.transaction_id || '';
//     const phoneNumber = payment.mpesa_phone_number || '';

//     const matchesSearch = 
//       contributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       phoneNumber.includes(searchTerm);

//     const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       <TopAppBar />
//       <div className="container mx-auto p-6">
//         {/* Update the header to be clearer */}
//         <div className="flex flex-col gap-2 mb-8">
//           <h1 className="text-3xl font-bold">Campaign Contributions</h1>
//           <p className="text-muted-foreground">
//             Monitor and manage all crowdfunding donations and M-Pesa transactions
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-7 w-24" />
//               ) : (
//                 <div>
//                   <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {stats?.totalCount || 0} transactions
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-7 w-16" />
//               ) : (
//                 <div>
//                   <p className="text-2xl font-bold">
//                     {(stats?.totalCount || 0) > 0 ? (((stats?.successfulPayments || 0) / stats.totalCount) * 100).toFixed(1) : 0}%
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {stats?.successfulPayments || 0} successful
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
//               <CreditCard className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-7 w-20" />
//               ) : (
//                 <div>
//                   <p className="text-2xl font-bold">{formatCurrency(stats?.averageAmount || 0)}</p>
//                   <p className="text-sm text-muted-foreground">
//                     per transaction
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <Skeleton className="h-7 w-20" />
//               ) : (
//                 <div>
//                   <p className="text-2xl font-bold">{formatCurrency(stats?.todayAmount || 0)}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {stats?.pendingPayments || 0} pending
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters and Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 placeholder="Search by contributor, campaign, transaction ID, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>
          
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-48">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Statuses</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="failed">Failed</SelectItem>
//               <SelectItem value="refunded">Refunded</SelectItem>
//             </SelectContent>
//           </Select>

//           <div className="flex gap-2">
//             <Button variant="outline" onClick={fetchPayments}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Refresh
//             </Button>
//             <Button variant="outline" onClick={exportPayments}>
//               <Download className="h-4 w-4 mr-2" />
//               Export
//             </Button>
//           </div>
//         </div>

//         {/* Payments Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Payments</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="space-y-4">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Skeleton key={i} className="h-16 w-full" />
//                 ))}
//               </div>
//             ) : filteredPayments.length === 0 ? (
//               <div className="text-center py-8">
//                 <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <p className="text-muted-foreground">No payments found</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {filteredPayments.map((payment) => (
//                   <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
//                     <div className="flex items-center gap-4 flex-1">
//                       <div className="flex items-center gap-2">
//                         {getStatusIcon(payment.status)}
//                         <Badge className={getStatusColor(payment.status)}>
//                           {payment.status}
//                         </Badge>
//                       </div>
                      
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <h4 className="font-medium">{payment.contributor?.name || 'Unknown Contributor'}</h4>
//                           <span className="text-sm text-gray-500">→</span>
//                           <span className="text-sm font-medium">{payment.campaign?.title || 'Unknown Campaign'}</span>
//                         </div>
//                         <div className="flex items-center gap-4 text-sm text-gray-500">
//                           <span>Phone: {payment.mpesa_phone_number || 'N/A'}</span>
//                           <span>•</span>
//                           <span>ID: {payment.transaction_id || 'N/A'}</span>
//                           <span>•</span>
//                           <span>{formatDate(payment.created_at)}</span>
//                         </div>
//                       </div>
                      
//                       <div className="text-right">
//                         <p className="font-semibold text-lg">
//                           {formatCurrency(payment.amount)}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {payment.payment_method.toUpperCase()}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2 ml-4">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedPayment(payment);
//                           setDetailsModalOpen(true);
//                         }}
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       {payment.status === 'completed' && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleRefundPayment(payment.id)}
//                         >
//                           Refund
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Payment Details Modal */}
//       <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Payment Details</DialogTitle>
//           </DialogHeader>
          
//           {selectedPayment && (
//             <div className="space-y-6">
//               {/* Payment Status */}
//               <div className="flex items-center gap-2">
//                 {getStatusIcon(selectedPayment.status)}
//                 <Badge className={getStatusColor(selectedPayment.status)}>
//                   {selectedPayment.status.toUpperCase()}
//                 </Badge>
//               </div>

//               {/* Transaction Info */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Amount</label>
//                   <p className="text-lg font-semibold">{formatCurrency(selectedPayment.amount)}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Transaction ID</label>
//                   <p className="font-mono text-sm">{selectedPayment.transaction_id || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Phone Number</label>
//                   <p>{selectedPayment.mpesa_phone_number || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Payment Method</label>
//                   <p className="uppercase">{selectedPayment.payment_method}</p>
//                 </div>
//               </div>

//               {/* Campaign Info */}
//               <div className="border-t pt-4">
//                 <h4 className="font-medium mb-2">Campaign Details</h4>
//                 <div className="space-y-2">
//                   <p><strong>Title:</strong> {selectedPayment.campaign?.title || 'Unknown Campaign'}</p>
//                   <p><strong>Creator:</strong> {
//                     selectedPayment.campaign?.creator?.organization_name || 
//                     selectedPayment.campaign?.creator?.name || 
//                     'Unknown Creator'
//                   }</p>
//                 </div>
//               </div>

//               {/* Contributor Info */}
//               <div className="border-t pt-4">
//                 <h4 className="font-medium mb-2">Contributor Details</h4>
//                 <div className="space-y-2">
//                   <p><strong>Name:</strong> {selectedPayment.contributor?.name || 'Unknown Contributor'}</p>
//                   <p><strong>Email:</strong> {selectedPayment.contributor?.email || 'unknown@email.com'}</p>
//                 </div>
//               </div>

//               {/* Timestamps */}
//               <div className="border-t pt-4">
//                 <h4 className="font-medium mb-2">Timeline</h4>
//                 <div className="space-y-2 text-sm">
//                   <p><strong>Created:</strong> {formatDate(selectedPayment.created_at)}</p>
//                   {selectedPayment.processed_at && (
//                     <p><strong>Processed:</strong> {formatDate(selectedPayment.processed_at)}</p>
//                   )}
//                   {selectedPayment.result_desc && (
//                     <p><strong>Result:</strong> {selectedPayment.result_desc}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AdminPayments;
