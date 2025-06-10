import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertTriangle,
  Clock,
  Shield,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  title: string;
  description: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  category: string;
  end_date: string;
  created_at: string;
  featured: boolean;
  campaign_image_url?: string;
  admin_notes?: string; // Add this field
  creator: {
    id: string;
    name: string;
    role: 'user' | 'organization';
    organization_name?: string;
  };
}

interface ReviewAction {
  campaignId: string;
  action: 'approve' | 'reject';
  notes: string;
}

const PendingCampaigns = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | ''>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending_approval');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<Campaign | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    fetchPendingCampaigns();
  }, [isAuthenticated, navigate, user, filterStatus]);

  const fetchPendingCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/campaigns');
      
      // Filter campaigns based on status
      const filteredCampaigns = response.data.filter((campaign: Campaign) => {
        if (filterStatus === 'all') return true;
        return campaign.status === filterStatus;
      });
      
      setCampaigns(filteredCampaigns);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedCampaign || !reviewAction) return;

    if (reviewAction === 'reject' && !reviewNotes.trim()) {
      toast({
        title: "Review notes required",
        description: "Please provide a reason for rejecting this campaign.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReview(true);

      const newStatus = reviewAction === 'approve' ? 'active' : 'rejected';
      
      const requestData = {
        status: newStatus,
        admin_notes: reviewNotes.trim() || null
      };

      console.log('Sending review request:', requestData); // Debug log

      const response = await axiosInstance.patch(`/admin/campaigns/${selectedCampaign.id}/status`, requestData);

      console.log('Review response:', response.data); // Debug log

      // Update local state
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === selectedCampaign.id 
          ? { ...campaign, status: newStatus }
          : campaign
      ));

      toast({
        title: `Campaign ${reviewAction}d`,
        description: `The campaign has been ${reviewAction}d successfully.`,
      });

      // Reset form
      setReviewDialogOpen(false);
      setSelectedCampaign(null);
      setReviewAction('');
      setReviewNotes('');
      
      // Refresh the list to remove approved/rejected campaigns if filtering
      if (filterStatus === 'pending_approval') {
        fetchPendingCampaigns();
      }
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      
      let errorMessage = "Failed to update campaign status";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewDialog = (campaign: Campaign, action: 'approve' | 'reject') => {
    setSelectedCampaign(campaign);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const openDetailsModal = (campaign: Campaign) => {
    console.log('Opening details modal for campaign:', campaign.title); // Debug log
    setSelectedCampaignDetails(campaign);
    setDetailsModalOpen(true);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const calculateDaysRemaining = (endDate: string) => {
    return Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_approval':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'draft':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusCounts = () => {
    const pending = campaigns.filter(c => c.status === 'pending_approval').length;
    const approved = campaigns.filter(c => c.status === 'active').length;
    const rejected = campaigns.filter(c => c.status === 'rejected').length;
    return { pending, approved, rejected };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Campaign Review</h1>
          <p className="text-muted-foreground">
            Review and approve campaigns submitted for platform publication
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{statusCounts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{statusCounts.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="active">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns List */}
        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))
          ) : campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-lg">{campaign.title}</h3>
                          {campaign.featured && (
                            <Badge variant="outline" className="text-xs">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {campaign.creator.role === 'organization' ? (
                            <>
                              <Building2 className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Organization</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="text-xs text-purple-600 font-medium">Individual</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Campaign Image */}
                    {campaign.campaign_image_url && (
                      <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={campaign.campaign_image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Campaign Description - Limited */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Campaign Description</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {truncateDescription(campaign.description)}
                      </p>
                      {campaign.description.length > 150 && (
                        <button
                          onClick={() => openDetailsModal(campaign)}
                          className="text-blue-600 hover:underline text-sm mt-2 inline-flex items-center gap-1"
                        >
                          Read more <Eye className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Campaign Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Funding Goal</span>
                        </div>
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(campaign.funding_goal)}
                        </p>
                      </div>

                      <div className="bg-green-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Category</span>
                        </div>
                        <p className="text-sm font-semibold text-green-900 capitalize">
                          {campaign.category}
                        </p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">End Date</span>
                        </div>
                        <p className="text-sm font-semibold text-purple-900">
                          {formatDate(campaign.end_date)}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">Submitted</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(campaign.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Creator Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Creator Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Creator Name</p>
                          <p className="font-medium">{campaign.creator.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="font-medium capitalize">
                            {campaign.creator.role === 'organization' 
                              ? `Organization` 
                              : 'Individual User'
                            }
                          </p>
                        </div>
                        {campaign.creator.organization_name && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Organization Name</p>
                            <p className="font-medium">{campaign.creator.organization_name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDetailsModal(campaign)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                      
                      {campaign.status === 'pending_approval' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => openReviewDialog(campaign, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openReviewDialog(campaign, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">
                  {filterStatus === 'pending_approval' 
                    ? "No campaigns are currently pending approval"
                    : `No campaigns with status: ${filterStatus.replace('_', ' ')}`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Campaign Details Modal - Using existing data */}
        <Dialog open={detailsModalOpen} onOpenChange={(open) => {
          console.log('Modal open state changed:', open); // Debug log
          setDetailsModalOpen(open);
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedCampaignDetails ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-6 w-6 text-green-600" />
                    {selectedCampaignDetails.title}
                    {selectedCampaignDetails.featured && (
                      <Badge variant="outline" className="text-xs">Featured</Badge>
                    )}
                  </DialogTitle>
                  <div className="flex items-center gap-4 pt-2">
                    <Badge className={getStatusColor(selectedCampaignDetails.status)}>
                      {selectedCampaignDetails.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {selectedCampaignDetails.creator.role === 'organization' ? (
                        <>
                          <Building2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Organization Campaign</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-600 font-medium">Individual Campaign</span>
                        </>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Campaign Images/Media */}
                  {selectedCampaignDetails.campaign_image_url && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Campaign Media</h4>
                      <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={selectedCampaignDetails.campaign_image_url}
                          alt={selectedCampaignDetails.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Full Description */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Complete Campaign Description</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedCampaignDetails.description}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Goals & Financial Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Financial Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Funding Goal</span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            {formatCurrency(selectedCampaignDetails.funding_goal)}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Current Funding</span>
                          </div>
                          <p className="text-lg font-bold text-green-900">
                            {formatCurrency(selectedCampaignDetails.current_funding)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span>{calculateProgress(selectedCampaignDetails.current_funding, selectedCampaignDetails.funding_goal).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.min(calculateProgress(selectedCampaignDetails.current_funding, selectedCampaignDetails.funding_goal), 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Campaign Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium">Campaign End Date</p>
                            <p className="text-sm text-gray-600">{formatDate(selectedCampaignDetails.end_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">Submitted</p>
                            <p className="text-sm text-gray-600">{formatDate(selectedCampaignDetails.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                          <Target className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Category</p>
                            <p className="text-sm text-gray-600 capitalize">{selectedCampaignDetails.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creator Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Creator Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Creator Name</p>
                          <p className="font-medium">{selectedCampaignDetails.creator.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="font-medium capitalize">
                            {selectedCampaignDetails.creator.role === 'organization' 
                              ? `Verified Organization` 
                              : 'Individual User'
                            }
                          </p>
                        </div>
                        {selectedCampaignDetails.creator.organization_name && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Organization Name</p>
                            <p className="font-medium">{selectedCampaignDetails.creator.organization_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Campaign Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-800">Category</p>
                        <p className="text-lg font-bold text-blue-900 capitalize">
                          {selectedCampaignDetails.category}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded text-center">
                        <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-800">Days Remaining</p>
                        <p className="text-lg font-bold text-green-900">
                          {calculateDaysRemaining(selectedCampaignDetails.end_date)}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded text-center">
                        <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-purple-800">Verification</p>
                        <p className="text-lg font-bold text-purple-900">
                          {selectedCampaignDetails.creator.role === 'organization' ? 'Verified' : 'Standard'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Actions in Modal */}
                  {selectedCampaignDetails.status === 'pending_approval' && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setDetailsModalOpen(false);
                          openReviewDialog(selectedCampaignDetails, 'reject');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Campaign
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setDetailsModalOpen(false);
                          openReviewDialog(selectedCampaignDetails, 'approve');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Campaign
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No campaign details available</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {reviewAction === 'approve' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {reviewAction === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
              </DialogTitle>
              <DialogDescription>
                {selectedCampaign && (
                  <>
                    {reviewAction === 'approve' 
                      ? `Are you sure you want to approve "${selectedCampaign.title}"? This will make it visible to all users on the platform.`
                      : `Are you sure you want to reject "${selectedCampaign.title}"? Please provide a reason for rejection.`
                    }
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? "Add any notes about this approval..."
                      : "Please explain why this campaign is being rejected..."
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setReviewDialogOpen(false)}
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={submittingReview || (reviewAction === 'reject' && !reviewNotes.trim())}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {submittingReview ? 'Processing...' : 
                 reviewAction === 'approve' ? 'Approve Campaign' : 'Reject Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PendingCampaigns;
