import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, DollarSign, Loader2, Target, Users, TrendingUp, Shield, AlertTriangle, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
}

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalBackers: number;
  fundingGoal: number;
  successRate: number;
}

interface OrganizationProfile {
  id: string;
  organization_name: string;
  organization_description: string;
  organization_registration_number: string;
  contact_person: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  registration_certificate_url?: string;
  approval_notes?: string;
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalBackers: 0,
    fundingGoal: 0,
    successRate: 0
  });
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [showPublicFeed, setShowPublicFeed] = useState(true);
  const [publicCampaigns, setPublicCampaigns] = useState<Campaign[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'organization') {
      navigate('/client-dashboard');
      return;
    }

    const fetchOrganizationData = async () => {
      try {
        console.log('Fetching organization data for user:', user?.id);
        
        // Fetch organization profile with better error handling
        try {
          const profileResponse = await axiosInstance.get('/organizations/profile');
          console.log('Organization profile response:', profileResponse.data);
          setOrganizationProfile(profileResponse.data);

          // Only fetch campaigns and public campaigns if organization is approved
          if (profileResponse.data?.approval_status === 'approved') {
            console.log('Organization is approved, fetching campaigns...');
            
            try {
              // Fetch user's own campaigns
              const campaignsResponse = await axiosInstance.get('/campaigns/my-campaigns');
              const campaignData = campaignsResponse.data;
              setCampaigns(campaignData);

              // Calculate dashboard stats
              const stats = {
                totalCampaigns: campaignData.length,
                activeCampaigns: campaignData.filter((c: Campaign) => 
                  c.status === 'active'
                ).length,
                totalRaised: campaignData.reduce((sum: number, c: Campaign) => sum + c.current_funding, 0),
                totalBackers: 0,
                fundingGoal: campaignData.reduce((sum: number, c: Campaign) => sum + c.funding_goal, 0),
                successRate: campaignData.length > 0 
                  ? (campaignData.filter((c: Campaign) => c.status === 'funded').length / campaignData.length) * 100 
                  : 0
              };
              setStats(stats);

              // Fetch public campaigns for discovery feed
              const publicCampaignsResponse = await axiosInstance.get('/campaigns/public?limit=10');
              setPublicCampaigns(publicCampaignsResponse.data);
              
              console.log('Successfully loaded campaign data for approved organization');
            } catch (campaignError: any) {
              console.error('Error fetching campaigns for approved organization:', campaignError);
              // Don't fail the whole page if campaigns can't be loaded
              toast({
                title: "Warning",
                description: "Could not load campaign data. Some features may be limited.",
                variant: "destructive"
              });
            }
          } else {
            console.log(`Organization not approved (status: ${profileResponse.data?.approval_status}), skipping campaign requests`);
            // Reset campaign-related state for non-approved organizations
            setCampaigns([]);
            setPublicCampaigns([]);
            setStats({
              totalCampaigns: 0,
              activeCampaigns: 0,
              totalRaised: 0,
              totalBackers: 0,
              fundingGoal: 0,
              successRate: 0
            });
          }
        } catch (profileError: any) {
          console.error('Organization profile fetch error:', profileError);
          
          if (profileError.response?.status === 404) {
            // Organization profile doesn't exist - show proper error message
            console.log('Organization profile not found - setup incomplete');
            
            toast({
              title: "Organization Setup Incomplete",
              description: "Your organization profile was not properly created during registration. Please contact support.",
              variant: "destructive"
            });
            
            // Set a minimal profile for UI display but with error state
            setOrganizationProfile({
              id: '',
              organization_name: 'Setup Required',
              organization_description: 'Please contact support to complete your organization setup',
              organization_registration_number: '',
              contact_person: user?.name || '',
              approval_status: 'pending'
            });
          } else if (profileError.response?.status === 403) {
            // User is not an organization
            navigate('/client-dashboard');
            return;
          } else {
            throw profileError; // Re-throw other errors
          }
        }
      } catch (error: any) {
        console.error('Error in fetchOrganizationData:', error);
        
        // Handle specific error cases
        if (error.response?.status === 403) {
          // User is not an organization
          navigate('/client-dashboard');
          return;
        }
        
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load organization data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [isAuthenticated, navigate, user]);

  const handleCertificateUpload = async () => {
    if (!certificateFile) return;

    try {
      setUploadingCertificate(true);
      
      const formData = new FormData();
      formData.append('certificate', certificateFile);

      const response = await axiosInstance.post('/organizations/upload-certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setOrganizationProfile(prev => prev ? {
        ...prev,
        registration_certificate_url: response.data.certificate_url
      } : null);

      setCertificateFile(null);
      
      toast({
        title: "Certificate Uploaded",
        description: "Your registration certificate has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload certificate",
        variant: "destructive"
      });
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
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

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchPublicCampaigns = async () => {
    // Only allow approved organizations to fetch public campaigns
    if (organizationProfile?.approval_status !== 'approved') {
      console.log('Organization not approved, cannot fetch public campaigns');
      toast({
        title: "Access Restricted",
        description: "You need to be an approved organization to view public campaigns.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoadingPublic(true);
      
      // Try main endpoint, fall back to alternative
      let response;
      try {
        response = await axiosInstance.get('/campaigns/public?limit=10');
      } catch (error: any) {
        if (error.response?.status === 500) {
          console.log('Main endpoint failed, trying alternative...');
          response = await axiosInstance.get('/campaigns/public-alt?limit=10');
        } else {
          throw error;
        }
      }
      
      // Process the response data to ensure proper number formatting
      const processedCampaigns = (response.data || []).map((campaign: any) => ({
        ...campaign,
        comments_count: Number(campaign.comments_count) || 0,
        contributors_count: Number(campaign.contributors_count) || 0,
        current_funding: Number(campaign.current_funding) || 0,
        funding_goal: Number(campaign.funding_goal) || 1
      }));
      
      setPublicCampaigns(processedCampaigns);
    } catch (error) {
      console.error('Error fetching public campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load public campaigns.",
        variant: "destructive"
      });
    } finally {
      setLoadingPublic(false);
    }
  };

  if (!user || !organizationProfile) {
    return null;
  }

  // Show approval pending/rejected state
  if (organizationProfile.approval_status !== 'approved') {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className={`border-2 ${organizationProfile.approval_status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className={`h-6 w-6 ${organizationProfile.approval_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`} />
                  Organization {organizationProfile.approval_status === 'pending' ? 'Approval Pending' : 'Approval Required'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {organizationProfile.approval_status === 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">⏳ Review in Progress</h3>
                    <p className="text-blue-700 text-sm">
                      Your organization registration is currently under review by our admin team. 
                      This process typically takes 24-48 hours. Please ensure all information is complete and accurate.
                    </p>
                    <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                      <p className="text-blue-800 text-sm font-medium">
                        💡 Tip: Upload your registration certificate below to speed up the approval process!
                      </p>
                    </div>
                  </div>
                )}

                {organizationProfile.approval_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 mb-2">❌ Application Not Approved</h3>
                    <p className="text-red-700 text-sm mb-3">
                      Your organization registration needs some updates before it can be approved. 
                      Please review the feedback below and make the necessary changes.
                    </p>
                    {organizationProfile.approval_notes && (
                      <div className="bg-white border border-red-200 rounded p-3 mt-3">
                        <p className="text-sm font-medium text-red-800 mb-1">Admin Feedback:</p>
                        <p className="text-sm text-gray-700">{organizationProfile.approval_notes}</p>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                      <p className="text-red-800 text-sm">
                        📧 <strong>Check your email</strong> - We've sent detailed instructions on how to update your application.
                      </p>
                    </div>
                  </div>
                )}

                {/* Organization Details */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Organization Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Organization Name</p>
                      <p className="font-medium">{organizationProfile.organization_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact Person</p>
                      <p className="font-medium">{organizationProfile.contact_person}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Description</p>
                      <p className="font-medium">{organizationProfile.organization_description}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Registration Number</p>
                      <p className="font-medium">{organizationProfile.organization_registration_number || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Upload */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Registration Certificate</h3>
                  
                  {organizationProfile.registration_certificate_url ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Certificate uploaded successfully</span>
                      </div>
                      <a 
                        href={organizationProfile.registration_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View uploaded certificate →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Upload your official registration certificate to help speed up the approval process.
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                          className="text-sm"
                        />
                        <Button
                          onClick={handleCertificateUpload}
                          disabled={!certificateFile || uploadingCertificate}
                          size="sm"
                        >
                          {uploadingCertificate ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Accepted formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Contact Information */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Need Help?
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      If you have questions about the approval process or need assistance:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a 
                        href="mailto:transcends.corp@gmail.com" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        transcends.corp@gmail.com
                      </a>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="text-gray-600">Response within 24 hours</span>
                    </div>
                  </div>
                </div>

                {/* Status-specific action */}
                {organizationProfile.approval_status === 'rejected' && (
                  <div className="text-center">
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Refresh Application Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show setup incomplete state for organizations without proper records
  if (organizationProfile?.organization_name === 'Setup Required') {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  Organization Setup Incomplete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">❌ Profile Setup Required</h3>
                  <p className="text-red-700 text-sm">
                    Your organization profile was not properly created during registration. 
                    This may be due to a system error or incomplete registration process.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">What to do next:</h3>
                  <div className="space-y-2 text-sm">
                    <p>• Contact our support team to complete your organization setup</p>
                    <p>• Provide your account email and organization details</p>
                    <p>• Our team will manually create your organization profile</p>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a 
                        href="mailto:transcends.corp@gmail.com" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        transcends.corp@gmail.com
                      </a>
                      <span className="hidden sm:inline text-gray-400">•</span>
                      <span className="text-gray-600">Response within 24 hours</span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      <strong>Include in your email:</strong> Your account email ({user?.email}) and organization name
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => navigate('/client-dashboard')} 
                    variant="outline"
                    className="mr-2"
                  >
                    Use Individual Dashboard
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Refresh Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Normal dashboard for approved organizations
  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        {/* Header with tabs */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
            <Badge className="bg-green-100 text-green-800">
              ✓ Approved Organization
            </Badge>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={showPublicFeed ? "default" : "outline"}
              onClick={() => setShowPublicFeed(true)}
            >
              Discover Campaigns
            </Button>
            <Button
              variant={!showPublicFeed ? "default" : "outline"}
              onClick={() => setShowPublicFeed(false)}
            >
              My Campaigns
            </Button>
          </div>
        </div>

        {showPublicFeed ? (
          // Public Feed View - Only show for approved organizations
          <div className="space-y-6">
            {organizationProfile?.approval_status === 'approved' ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Discover and support other organizations' causes
                  </p>
                  <Link to="/create-campaign">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </Link>
                </div>

                {loadingPublic ? (
                  <div className="text-center py-8">Loading campaigns...</div>
                ) : (
                  <div className="space-y-6">
                    {publicCampaigns.map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {(campaign.profiles?.organization_name || campaign.profiles?.name || 'U').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">
                                  {campaign.profiles?.organization_name || campaign.profiles?.name || 'Unknown User'}
                                </h3>
                                <Badge variant={campaign.profiles?.role === 'organization' ? 'default' : 'secondary'} className="text-xs">
                                  {campaign.profiles?.role === 'organization' ? 'Organization' : 'Individual'}
                                </Badge>
                                {campaign.creator_id === user?.id && (
                                  <Badge variant="outline" className="text-xs">Your Campaign</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
                              <p className="text-gray-600 line-clamp-3">{campaign.description}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                              {campaign.creator_id !== user?.id ? (
                                <Link to={`/campaigns/${campaign.id}`} className="flex-1">
                                  <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Support This Cause
                                  </Button>
                                </Link>
                              ) : (
                                <Link to={`/campaigns/${campaign.id}`} className="flex-1">
                                  <Button variant="outline" className="w-full">
                                    <Target className="h-4 w-4 mr-2" />
                                    Manage Campaign
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Show message for non-approved organizations trying to access public feed
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-yellow-900 mb-2">
                    Approval Required
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    You need to be an approved organization to discover and support other campaigns.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPublicFeed(false)}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                  >
                    View My Organization Status
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // My Campaigns View - Always accessible but limited for non-approved orgs
          <div>
            {organizationProfile?.approval_status === 'approved' ? (
              <>
                {/* Campaign Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</p>
                          <p className="text-sm text-muted-foreground">
                            of {formatCurrency(stats.fundingGoal)} goal
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
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Quick Actions */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Campaigns</h2>
                  <Link to="/create-campaign" className="block">
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </Link>
                </div>

                {/* Campaign grid for approved organizations */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading...
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 flex items-center justify-center">
                          <p className="text-muted-foreground">Loading campaign data...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : campaigns.length === 0 ? (
                    <Card className="hover:shadow-lg transition-shadow col-span-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          No Campaigns Yet
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          Start making an impact by creating your first campaign!
                        </p>
                        <Link to="/create-campaign" className="block">
                          <Button className="w-full">Create Campaign</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    campaigns.slice(0, 3).map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              {campaign.title}
                            </CardTitle>
                            <div className="flex flex-col gap-1">
                              <Badge className={getStatusColor(campaign.status)}>
                                {campaign.status.replace('_', ' ')}
                              </Badge>
                              {campaign.featured && (
                                <Badge variant="outline" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {campaign.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{formatCurrency(campaign.current_funding)}</span>
                              <span>{formatCurrency(campaign.funding_goal)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${calculateProgress(campaign.current_funding, campaign.funding_goal)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {calculateProgress(campaign.current_funding, campaign.funding_goal).toFixed(1)}% funded
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Ends: {formatDate(campaign.end_date)}
                            </span>
                            <Link to={`/campaigns/${campaign.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {campaigns.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link to="/campaigns">
                      <Button variant="outline">
                        View All Campaigns ({campaigns.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              // Show limited view for non-approved organizations
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Campaign Creation Pending Approval
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Once your organization is approved, you'll be able to create and manage campaigns here.
                  </p>
                  <div className="text-sm text-blue-600">
                    Current Status: <Badge className="bg-yellow-100 text-yellow-800">
                      {organizationProfile?.approval_status || 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
