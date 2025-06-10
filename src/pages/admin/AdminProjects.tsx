import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Users, Building2, Filter } from "lucide-react";
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
  creator: {
    id: string;
    name: string;
    role: 'user' | 'organization';
    organization_name?: string;
  };
}

const AdminProjects = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    const fetchCampaigns = async () => {
      try {
        const response = await axiosInstance.get('/admin/campaigns');
        setCampaigns(response.data);
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

    fetchCampaigns();
  }, [isAuthenticated, navigate, user]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.creator.organization_name && campaign.creator.organization_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    const matchesCreator = creatorFilter === 'all' || 
      (creatorFilter === 'organization' && campaign.creator.role === 'organization') ||
      (creatorFilter === 'individual' && campaign.creator.role === 'user');
    
    return matchesSearch && matchesStatus && matchesCreator;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
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

  const getCreatorTypeStats = () => {
    const organizationCampaigns = campaigns.filter(c => c.creator.role === 'organization').length;
    const individualCampaigns = campaigns.filter(c => c.creator.role === 'user').length;
    return { organizationCampaigns, individualCampaigns };
  };

  const stats = getCreatorTypeStats();

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Campaign Oversight</h1>
          <p className="text-muted-foreground">
            View and manage all campaigns from organizations and individual users
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Organization Campaigns</p>
                  <p className="text-2xl font-bold">{stats.organizationCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Individual Campaigns</p>
                  <p className="text-2xl font-bold">{stats.individualCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredCampaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search campaigns, creators, or organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={creatorFilter} onValueChange={setCreatorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              <SelectItem value="organization">Organizations</SelectItem>
              <SelectItem value="individual">Individuals</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns List */}
        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
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
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {campaign.description}
                        </p>
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

                    {/* Campaign Progress */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{formatCurrency(campaign.current_funding)} raised</span>
                        <span className="text-muted-foreground">{formatCurrency(campaign.funding_goal)} goal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all" 
                          style={{ width: `${calculateProgress(campaign.current_funding, campaign.funding_goal)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {calculateProgress(campaign.current_funding, campaign.funding_goal).toFixed(1)}% funded
                      </p>
                    </div>

                    {/* Campaign Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Creator</p>
                        <p className="font-medium">
                          {campaign.creator.role === 'organization' 
                            ? campaign.creator.organization_name || campaign.creator.name
                            : campaign.creator.name
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{campaign.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">{formatDate(campaign.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(campaign.created_at)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm">View Campaign</Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
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
                  {searchTerm || statusFilter !== 'all' || creatorFilter !== 'all'
                    ? "Try adjusting your filters to see more campaigns"
                    : "No campaigns have been created yet"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
