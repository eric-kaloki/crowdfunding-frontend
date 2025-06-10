import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Users, 
  Target, 
  Calendar, 
  MapPin, 
  Clock, 
  Eye, 
  Send, 
  ThumbsUp, 
  CheckCircle,
  Shield, // Add Shield import here
  Loader2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@radix-ui/react-select';

interface Campaign {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  category: string;
  end_date: string;
  created_at: string;
  image_url?: string;
  campaign_image?: string;
  profiles: {
    id: string;
    name: string;
    role: string;
    organization_name?: string;
  };
}

interface Contribution {
  id: string;
  amount: number;
  created_at: string;
  anonymous: boolean;
  notes?: string;
  contributor: {
    id: string;
    name: string;
  };
}

interface Comment {
  id: string;
  message: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface Update {
  id: string;
  title: string;
  message: string;
  created_at: string;
  image_url?: string;
}

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contributors' | 'comments' | 'updates'>('overview');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', message: '' });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationNotes, setDonationNotes] = useState('');
  const [isDonationAnonymous, setIsDonationAnonymous] = useState(false);
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [realTimeCommentsCount, setRealTimeCommentsCount] = useState<number>(0);
  const [donationPhoneNumber, setDonationPhoneNumber] = useState('');
  const [phoneNumberSource, setPhoneNumberSource] = useState<'profile' | 'manual'>('profile');

  // WebSocket connection for real-time updates
  const { subscribeToCampaign, unsubscribeFromCampaign } = useWebSocket({
    url: process.env.NODE_ENV === 'production' 
      ? 'wss://your-domain.com' 
      : 'ws://localhost:5000',
    onMessage: (message) => {
      if (message.campaignId === id) {
        handleRealTimeUpdate(message);
      }
    },
    onConnect: () => {
      console.log('Connected to real-time updates');
      if (id) {
        subscribeToCampaign(id);
      }
    }
  });

  const handleRealTimeUpdate = (message: any) => {
    switch (message.type) {
      case 'comment_added':
        // Add new comment to the list
        setComments(prev => [message.data.comment, ...prev]);
        setRealTimeCommentsCount(message.data.comments_count);
        toast({
          title: "New Comment",
          description: "Someone just commented on this campaign!",
        });
        break;

      case 'comment_liked':
        // Update comment likes
        setComments(prev => prev.map(comment => 
          comment.id === message.data.comment_id
            ? {
                ...comment,
                likes_count: message.data.likes_count,
                is_liked: message.data.user_id === user?.id ? message.data.is_liked : comment.is_liked
              }
            : comment
        ));
        break;

      case 'contribution_added':
        // Update funding amount
        setCampaign(prev => prev ? {
          ...prev,
          current_funding: message.data.new_total
        } : null);
        toast({
          title: "New Contribution",
          description: `Someone just contributed ${message.data.amount}!`,
        });
        break;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Early return if no campaign ID
    if (!id) {
      toast({
        title: "Error",
        description: "No campaign ID provided",
        variant: "destructive"
      });
      navigate(-1);
      return;
    }

    const fetchCampaignData = async () => {
      try {
        setLoading(true);

        // Fetch campaign details
        const campaignResponse = await axiosInstance.get(`/campaigns/${id}`);
        setCampaign(campaignResponse.data);

        // Fetch comments (public)
        const commentsResponse = await axiosInstance.get(`/campaigns/${id}/comments`);
        setComments(commentsResponse.data || []);

        // Check if user is creator or admin for protected data
        const campaign = campaignResponse.data;
        const isUserCreator = campaign?.creator_id && user?.id && campaign.creator_id === user.id;
        const canViewProtected = isUserCreator || user?.role === 'admin';

        // Fetch contributions (only for creator/admin)
        if (canViewProtected) {
          try {
            const contributionsResponse = await axiosInstance.get(`/campaigns/${id}/contributions`);
            setContributions(contributionsResponse.data || []);
          } catch (error) {
            console.log('Could not fetch contributions - may be restricted');
          }

          // Fetch updates (only for creator/admin)
          try {
            const updatesResponse = await axiosInstance.get(`/campaigns/${id}/updates`);
            setUpdates(updatesResponse.data || []);
          } catch (error) {
            console.log('Could not fetch updates - may be restricted');
          }
        }

      } catch (error: any) {
        console.error('Error fetching campaign data:', error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load campaign details",
          variant: "destructive"
        });
        
        if (error.response?.status === 404) {
          navigate('/client-dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [id, isAuthenticated, navigate, user?.id, user?.role]); // Remove isCreator from dependency array

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id) return;

    try {
      setSubmittingComment(true);
      const response = await axiosInstance.post(`/campaigns/${id}/comments`, {
        message: newComment.trim()
      });

      // The real-time update will handle adding the comment to the list
      // Just clear the input and update local count
      setNewComment('');
      
      if (response.data.comments_count) {
        setRealTimeCommentsCount(response.data.comments_count);
      }

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!newUpdate.title.trim() || !newUpdate.message.trim() || !id) return;

    try {
      setSubmittingUpdate(true);
      const response = await axiosInstance.post(`/campaigns/${id}/updates`, newUpdate);

      if (response.data) {
        setUpdates(prev => [response.data, ...prev]);
        setNewUpdate({ title: '', message: '' });
        
        toast({
          title: "Update Posted",
          description: "Campaign update has been posted successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to post update",
        variant: "destructive"
      });
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!id || !commentId) return;

    try {
      await axiosInstance.post(`/campaigns/${id}/comments/${commentId}/like`);
      // Real-time update will handle the UI update
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive"
      });
    }
  };

  // Fetch user's phone number when modal opens
  useEffect(() => {
    if (showDonationModal && user) {
      // Try to get phone number from user profile
      const fetchUserPhone = async () => {
        try {
          const response = await axiosInstance.get('/auth/profile');
          const userPhone = response.data.phone;
          
          if (userPhone && userPhone.trim()) {
            setDonationPhoneNumber(userPhone);
            setPhoneNumberSource('profile');
          } else {
            setPhoneNumberSource('manual');
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setPhoneNumberSource('manual');
        }
      };

      fetchUserPhone();
    }
  }, [showDonationModal, user]);

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }

    if (!donationPhoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please provide a phone number for M-Pesa payment.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(?:\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(donationPhoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678).",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingDonation(true);
      
      const payload = {
        amount: parseFloat(donationAmount),
        anonymous: isDonationAnonymous,
        notes: donationNotes.trim() || undefined,
        phone_number: donationPhoneNumber.replace(/\s/g, '') // Remove spaces
      };

      console.log('Submitting donation:', payload);

      const response = await axiosInstance.post(`/campaigns/${id}/contribute`, payload);

      if (response.data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa prompt to complete your donation.",
        });

        // Update campaign funding optimistically
        setCampaign(prev => prev ? {
          ...prev,
          current_funding: prev.current_funding + parseFloat(donationAmount)
        } : null);

        // Reset form and close modal
        setDonationAmount('');
        setDonationNotes('');
        setIsDonationAnonymous(false);
        setShowDonationModal(false);

        // Store contribution ID for status checking
        localStorage.setItem(`contribution_${response.data.contribution.id}`, JSON.stringify({
          id: response.data.contribution.id,
          amount: response.data.contribution.amount,
          campaign_id: id,
          checkout_request_id: response.data.mpesa.checkout_request_id
        }));

      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('Donation error:', error);
      
      let errorMessage = "Failed to process donation. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Donation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmittingDonation(false);
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
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'funded':
        return 'bg-green-500/10 text-green-500';
      case 'active':
        return 'bg-blue-500/10 text-blue-500';
      case 'pending_approval':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'draft':
        return 'bg-gray-500/10 text-gray-500';
      case 'closed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Add safety checks for user and campaign before using them
  const isCreator = campaign?.creator_id && user?.id && campaign.creator_id === user.id;
  const canViewContributions = isCreator || user?.role === 'admin';
  const canViewUpdates = isCreator || user?.role === 'admin'; // Lock updates to creator and admin only

  // Calculate daysLeft BEFORE using it in canDonate
  const daysLeft = campaign?.end_date ? Math.max(0, Math.ceil(
    (new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )) : 0;

  // Now we can safely use daysLeft in canDonate
  const canDonate = campaign && !isCreator && campaign.status === 'active' && daysLeft > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{campaign.title || 'Untitled Campaign'}</h1>
            <p className="text-muted-foreground">
              by {campaign.profiles?.organization_name || campaign.profiles?.name || 'Unknown Creator'}
            </p>
          </div>
          <Badge className={getStatusColor(campaign.status || 'unknown')}>
            {(campaign.status || 'unknown').replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            {(campaign.campaign_image || campaign.image_url) && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={campaign.campaign_image || campaign.image_url}
                    alt={campaign.title || 'Campaign image'}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'contributors', 'comments', 'updates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  disabled={(tab === 'contributors' && !canViewContributions) || (tab === 'updates' && !canViewUpdates)}
                >
                  {tab === 'contributors' && !canViewContributions ? '🔒 Contributors' : 
                   tab === 'updates' && !canViewUpdates ? '🔒 Updates' : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{campaign.description || 'No description available.'}</p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Category: {campaign.category || 'Uncategorized'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {campaign.created_at ? formatDate(campaign.created_at) : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Creator: {campaign.profiles?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {campaign.profiles?.role || 'Unknown'} Account
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'contributors' && canViewContributions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contributors ({contributions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contributions.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No contributions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {contribution.anonymous ? '?' : (contribution.contributor?.name?.charAt(0) || '?')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {contribution.anonymous ? 'Anonymous Supporter' : (contribution.contributor?.name || 'Unknown Contributor')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {contribution.created_at ? formatDateTime(contribution.created_at) : 'Unknown date'}
                              </p>
                              {contribution.notes && (
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  "{contribution.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(contribution.amount || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'comments' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments & Support ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share your thoughts, encouragement, or questions..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || submittingComment}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Be the first to comment!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {comment.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{comment.user.name}</p>
                                {comment.user.role === 'organization' && (
                                  <Badge variant="secondary" className="text-xs">Org</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeComment(comment.id)}
                                  className={`h-8 px-2 ${comment.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${comment.is_liked ? 'fill-current' : ''}`} />
                                  {comment.likes_count}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'updates' && canViewUpdates && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Creator can add updates */}
                  {isCreator && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium mb-3">Post an Update</h4>
                      <div className="space-y-3">
                        <Input
                          placeholder="Update title"
                          value={newUpdate.title}
                          onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Share what's new with your supporters..."
                          value={newUpdate.message}
                          onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                        />
                        <Button 
                          onClick={handleUpdateSubmit}
                          disabled={submittingUpdate || !newUpdate.title.trim() || !newUpdate.message.trim()}
                        >
                          {submittingUpdate ? 'Posting...' : 'Post Update'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Updates List */}
                  <div className="space-y-4">
                    {updates.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No updates yet.</p>
                    ) : (
                      updates.map((update) => (
                        <div key={update.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="font-medium">{update.title}</h4>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {formatDateTime(update.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{update.message}</p>
                          {update.image_url && (
                            <img
                              src={update.image_url}
                              alt="Update"
                              className="w-full h-48 object-cover rounded-lg mt-3"
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show locked message for updates if user cannot view */}
            {activeTab === 'updates' && !canViewUpdates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔒 Campaign Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Updates are Private</h3>
                    <p className="text-muted-foreground">
                      Only the campaign creator and administrators can view campaign updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show locked message for contributors if user cannot view */}
            {activeTab === 'contributors' && !canViewContributions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔒 Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Contributors are Private</h3>
                    <p className="text-muted-foreground">
                      Only the campaign creator and administrators can view contributor details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(campaign.current_funding || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      raised of {formatCurrency(campaign.funding_goal || 0)} goal
                    </p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(campaign.current_funding || 0, campaign.funding_goal || 1)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>{calculateProgress(campaign.current_funding || 0, campaign.funding_goal || 1).toFixed(1)}% funded</span>
                    <span>{contributions.length} backers</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
                    </span>
                  </div>

                  {/* Updated Action Button */}
                  {canDonate ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => setShowDonationModal(true)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Now
                    </Button>
                  ) : isCreator ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Target className="h-4 w-4 mr-2" />
                      Your Campaign
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Campaign Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Creator Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campaign Creator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {campaign.profiles?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{campaign.profiles?.name || 'Unknown Creator'}</p>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.profiles?.role === 'organization' ? 'Organization' : 'Individual'}
                    </Badge>
                  </div>
                </div>
                {campaign.profiles?.organization_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium">{campaign.profiles.organization_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Views</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    --
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Comments</span>
                  <span className="text-sm font-medium">{realTimeCommentsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Updates</span>
                  <span className="text-sm font-medium">{updates.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Support This Campaign</DialogTitle>
            <DialogDescription>
              Your contribution will help {campaign?.profiles?.organization_name || campaign?.profiles?.name} reach their goal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Donation Amount (KES)</label>
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Enter amount (minimum KES 1)"
                min="1"
                step="1"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                M-Pesa Phone Number
                {phoneNumberSource === 'profile' && (
                  <span className="text-green-600 text-xs ml-2">(from your profile)</span>
                )}
              </label>
              <input
                type="tel"
                value={donationPhoneNumber}
                onChange={(e) => setDonationPhoneNumber(e.target.value)}
                placeholder="Enter M-Pesa number (e.g., 0712345678)"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 0712345678 or 254712345678
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                value={donationNotes}
                onChange={(e) => setDonationNotes(e.target.value)}
                placeholder="Add a message of support..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2 border rounded-md resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {donationNotes.length}/200 characters
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isDonationAnonymous}
                onChange={(e) => setIsDonationAnonymous(e.target.checked)}
              />
              <label htmlFor="anonymous" className="text-sm">
                Donate anonymously
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDonationModal(false)}
                disabled={submittingDonation}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleDonation}
                disabled={submittingDonation || !donationAmount || !donationPhoneNumber}
              >
                {submittingDonation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Donate KES ${donationAmount || '0'}`
                )}
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs text-blue-800">
                <Shield className="h-3 w-3 inline mr-1" />
                Your payment is secured by M-Pesa. You will receive an SMS prompt to authorize the transaction.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignDetails;
