import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Heart, MessageCircle, Share2, Users, Target, Calendar, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  comments_count?: number; // Make optional with default
  contributors_count?: number; // Make optional with default
  profiles: {
    id: string;
    name: string;
    role: string;
    organization_name?: string;
  };
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'Education',
    'Healthcare', 
    'Technology',
    'Environment',
    'Agriculture',
    'Community Development',
    'Arts & Culture',
    'Emergency Relief',
    'Sports & Recreation',
    'Other'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchCampaigns();
  }, [isAuthenticated, navigate, selectedCategory]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        limit: '20'
      });
      
      // Try the main endpoint first, fall back to alternative if it fails
      let response;
      try {
        response = await axiosInstance.get(`/campaigns/public?${params}`);
      } catch (error: any) {
        if (error.response?.status === 500) {
          console.log('Main endpoint failed, trying alternative...');
          response = await axiosInstance.get(`/campaigns/public-alt?${params}`);
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

      console.log('Processed campaigns:', processedCampaigns);
      setCampaigns(processedCampaigns);
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  const isOwnCampaign = (campaign: Campaign) => {
    return campaign.creator_id === user?.id;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Discover Campaigns</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Support causes you care about and make a difference
            </p>
          </div>
          <Link to="/create-campaign">
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Start Campaign
            </Button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>

        {/* Campaigns Feed */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1 flex-1">
                        <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 sm:w-20 h-2 sm:h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-full h-3 sm:h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-3 sm:h-4 bg-gray-200 rounded"></div>
                    <div className="w-full h-24 sm:h-32 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <Target className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No campaigns found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {selectedCategory === 'all' 
                    ? "Be the first to create a campaign!" 
                    : `No campaigns in ${selectedCategory} category yet.`}
                </p>
                <Link to="/create-campaign">
                  <Button className="w-full sm:w-auto">Create First Campaign</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarFallback className="text-xs sm:text-sm">
                        {(campaign.profiles?.organization_name || campaign.profiles?.name || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {campaign.profiles?.organization_name || campaign.profiles?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={campaign.profiles?.role === 'organization' ? 'default' : 'secondary'} className="text-xs">
                            {campaign.profiles?.role === 'organization' ? 'Organization' : 'Individual'}
                          </Badge>
                          {isOwnCampaign(campaign) && (
                            <Badge variant="outline" className="text-xs">Your Campaign</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>{getTimeAgo(campaign.created_at)}</span>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{campaign.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Content */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">{campaign.title}</h2>
                      <p className="text-sm sm:text-base text-gray-600 line-clamp-3">{campaign.description}</p>
                    </div>

                    {/* Campaign Image */}
                    {campaign.image_url && (
                      <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-lg">
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(campaign.current_funding)} raised
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(campaign.funding_goal)} goal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${calculateProgress(campaign.current_funding, campaign.funding_goal)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{calculateProgress(campaign.current_funding, campaign.funding_goal).toFixed(1)}% funded</span>
                        <span>Ends {formatDate(campaign.end_date)}</span>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{campaign.contributors_count || 0} supporters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{campaign.comments_count || 0} comments</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      {!isOwnCampaign(campaign) ? (
                        <Link to={`/campaigns/${campaign.id}`} className="flex-1">
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3">
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Support This Cause
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/campaigns/${campaign.id}`} className="flex-1">
                          <Button variant="outline" className="w-full text-sm sm:text-base py-2 sm:py-3">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Manage Campaign
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="ghost" size="sm" className="p-2 sm:p-3">
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {campaigns.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <Button variant="outline" onClick={fetchCampaigns} className="w-full sm:w-auto">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;