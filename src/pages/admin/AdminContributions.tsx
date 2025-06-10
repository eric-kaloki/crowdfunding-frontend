import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RefundConfirmationModal from '@/components/RefundConfirmationModal';

interface Contribution {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'refund_pending' | 'refund_failed';
  payment_method: string;
  transaction_id?: string;
  mpesa_phone_number?: string;
  created_at: string;
  processed_at?: string;
  refunded_at?: string;
  result_desc?: string;
  anonymous: boolean;
  notes?: string;
  refund_reason?: string;
  campaign: {
    id: string;
    title: string;
    creator: {
      id: string;
      name: string;
      organization_name?: string;
    };
  };
  contributor: {
    id: string;
    name: string;
    email: string;
  };
}

interface ContributionStats {
  totalAmount: number;
  totalCount: number;
  successfulContributions: number;
  failedContributions: number;
  pendingContributions: number;
  refundedContributions: number;
  averageAmount: number;
  monthlyGrowth: number;
  todayAmount: number;
}

const AdminContributions = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContributionStats>({
    totalAmount: 0,
    totalCount: 0,
    successfulContributions: 0,
    failedContributions: 0,
    pendingContributions: 0,
    refundedContributions: 0,
    averageAmount: 0,
    monthlyGrowth: 0,
    todayAmount: 0
  });
  
  // Filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundingContribution, setRefundingContribution] = useState<Contribution | null>(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    fetchContributions();
  }, [isAuthenticated, navigate, user]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/contributions');
      console.log('Contributions response:', response.data);
      
      const { contributions: contributionsData, stats: statsData } = response.data;
      
      // Safely set contributions with fallback
      setContributions(Array.isArray(contributionsData) ? contributionsData : []);
      
      // Safely set stats with proper fallbacks
      if (statsData && typeof statsData === 'object') {
        setStats({
          totalAmount: Number(statsData.totalAmount) || 0,
          totalCount: Number(statsData.totalCount) || 0,
          successfulContributions: Number(statsData.successfulContributions) || 0,
          failedContributions: Number(statsData.failedContributions) || 0,
          pendingContributions: Number(statsData.pendingContributions) || 0,
          refundedContributions: Number(statsData.refundedContributions) || 0,
          averageAmount: Number(statsData.averageAmount) || 0,
          monthlyGrowth: Number(statsData.monthlyGrowth) || 0,
          todayAmount: Number(statsData.todayAmount) || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching contributions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load contributions",
        variant: "destructive",
      });
      
      // Reset to empty state on error
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundContribution = async (reason: string) => {
    if (!refundingContribution) return;

    try {
      setIsProcessingRefund(true);
      
      const response = await axiosInstance.post(
        `/admin/contributions/${refundingContribution.id}/refund`,
        { reason }
      );
      
      // Handle different response types based on your previous implementation
      if (response.data.success === false && response.data.action_required === 'manual_processing') {
        // Sandbox/test environment limitation
        toast({
          title: "Sandbox Limitation",
          description: response.data.message || "M-Pesa reversal failed in test environment. Manual processing would be required in production.",
          variant: "destructive",
        });
      } else {
        // Update the contribution in the local state
        setContributions(prev => prev.map(contribution => 
          contribution.id === refundingContribution.id 
            ? { 
                ...contribution, 
                status: response.data.status === 'refund_pending' ? 'refund_pending' : 'refunded',
                refund_reason: reason,
                refunded_at: response.data.status === 'refunded' ? new Date().toISOString() : contribution.refunded_at
              }
            : contribution
        ));

        toast({
          title: "Refund Initiated",
          description: response.data.message || "The refund has been processed successfully.",
        });
      }
      
      // Close modal and reset state
      setRefundModalOpen(false);
      setRefundingContribution(null);
      setRefundReason('');

    } catch (error: any) {
      console.error('Refund error:', error);
      
      let errorMessage = "Failed to process refund. Please try again.";
      
      if (error.response?.data?.action_required === 'manual_processing') {
        errorMessage = error.response.data.error + " Manual processing required.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Refund Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const exportContributions = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        dateRange: dateFilter,
        search: searchTerm
      });

      const response = await axiosInstance.get(`/admin/contributions/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contributions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Export Complete",
        description: "Contributions data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to export contributions",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'refund_pending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'refund_failed':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'refund_pending':
        return 'bg-blue-100 text-blue-800';
      case 'refund_failed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openContributionDetails = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setDetailsModalOpen(true);
  };

  const openRefundModal = (contribution: Contribution) => {
    setRefundingContribution(contribution);
    setRefundModalOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort contributions
  const filteredContributions = contributions
    .filter(contribution => {
      const matchesSearch = 
        contribution.contributor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.campaign?.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.mpesa_phone_number?.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || contribution.status === statusFilter;
      
      const matchesDate = dateFilter === 'all' || (() => {
        const contributionDate = new Date(contribution.created_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            return contributionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return contributionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return contributionDate >= monthAgo;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'contributor':
          aValue = a.contributor?.name || '';
          bValue = b.contributor?.name || '';
          break;
        case 'campaign':
          aValue = a.campaign?.title || '';
          bValue = b.campaign?.title || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Campaign Contributions</h1>
          <p className="text-muted-foreground">
            Monitor and manage all crowdfunding donations and M-Pesa transactions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.totalCount || 0} contributions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.totalCount > 0 
                      ? ((stats.successfulContributions / stats.totalCount) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.successfulContributions || 0} successful
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.todayAmount || 0)}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.monthlyGrowth >= 0 ? '+' : ''}{stats?.monthlyGrowth?.toFixed(1) || 0}% from last month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.averageAmount || 0)}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingContributions || 0} pending
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by contributor, campaign, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="refund_pending">Refund Pending</SelectItem>
              <SelectItem value="refund_failed">Refund Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportContributions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Contributions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contributions ({filteredContributions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredContributions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contributions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('contributor')}>
                          Contributor
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('campaign')}>
                          Campaign
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('amount')}>
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('created_at')}>
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContributions.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {contribution.anonymous ? 'Anonymous' : contribution.contributor?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {contribution.contributor?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{contribution.campaign?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {contribution.campaign?.creator?.organization_name || contribution.campaign?.creator?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{formatCurrency(contribution.amount)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contribution.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(contribution.status)}
                              {contribution.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {contribution.payment_method === 'mpesa' ? 'M-Pesa' : contribution.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(contribution.created_at)}</p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openContributionDetails(contribution)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {contribution.status === 'completed' && (
                                <DropdownMenuItem 
                                  onClick={() => openRefundModal(contribution)}
                                  className="text-red-600"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Issue Refund
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contribution Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contribution Details</DialogTitle>
            </DialogHeader>
            
            {selectedContribution && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contributor Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedContribution.anonymous ? 'Anonymous' : selectedContribution.contributor?.name}</div>
                      <div><strong>Email:</strong> {selectedContribution.contributor?.email}</div>
                      <div><strong>Phone:</strong> {selectedContribution.mpesa_phone_number || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Campaign Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Campaign:</strong> {selectedContribution.campaign?.title}</div>
                      <div><strong>Creator:</strong> {selectedContribution.campaign?.creator?.organization_name || selectedContribution.campaign?.creator?.name}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Amount:</strong> {formatCurrency(selectedContribution.amount)}</div>
                      <div><strong>Method:</strong> {selectedContribution.payment_method}</div>
                      <div><strong>Transaction ID:</strong> {selectedContribution.transaction_id || 'N/A'}</div>
                      <div><strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(selectedContribution.status)}`}>
                          {selectedContribution.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Timestamps</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Created:</strong> {formatDate(selectedContribution.created_at)}</div>
                      <div><strong>Processed:</strong> {selectedContribution.processed_at ? formatDate(selectedContribution.processed_at) : 'N/A'}</div>
                      <div><strong>Refunded:</strong> {selectedContribution.refunded_at ? formatDate(selectedContribution.refunded_at) : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {selectedContribution.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Contributor Message</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{selectedContribution.notes}</p>
                  </div>
                )}

                {selectedContribution.result_desc && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Result</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{selectedContribution.result_desc}</p>
                  </div>
                )}

                {selectedContribution.refund_reason && (
                  <div>
                    <h4 className="font-medium mb-2">Refund Reason</h4>
                    <p className="text-sm bg-red-50 p-3 rounded border border-red-200">{selectedContribution.refund_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Refund Modal */}
        <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>
                Process a refund for this contribution. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {refundingContribution && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border">
                  <h4 className="font-medium mb-2">Contribution Details</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Amount:</strong> {formatCurrency(refundingContribution.amount)}</div>
                    <div><strong>Contributor:</strong> {refundingContribution.anonymous ? 'Anonymous' : refundingContribution.contributor?.name}</div>
                    <div><strong>Campaign:</strong> {refundingContribution.campaign?.title}</div>
                    <div><strong>Transaction ID:</strong> {refundingContribution.transaction_id || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Refund Reason</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter the reason for this refund..."
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRefundModalOpen(false)}
                    disabled={isProcessingRefund}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleRefundContribution(refundReason || 'No reason provided')}
                    disabled={isProcessingRefund}
                  >
                    {isProcessingRefund ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Issue Refund'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminContributions;
