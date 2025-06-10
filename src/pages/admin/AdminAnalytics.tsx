import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Building2,
  Heart,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCampaigns: number;
    totalRaised: number;
    totalContributions: number;
    growthMetrics: {
      userGrowth: number;
      campaignGrowth: number;
      revenueGrowth: number;
      contributionGrowth: number;
    };
  };
  campaigns: {
    byCategory: Array<{
      category: string;
      count: number;
      totalRaised: number;
    }>;
    byStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    topPerforming: Array<{
      id: string;
      title: string;
      raised: number;
      goal: number;
      contributors: number;
    }>;
  };
  users: {
    registrationTrend: Array<{
      date: string;
      count: number;
    }>;
    byRole: Array<{
      role: string;
      count: number;
      percentage: number;
    }>;
    activeUsers: number;
  };
  contributions: {
    dailyTrend: Array<{
      date: string;
      amount: number;
      count: number;
    }>;
    averageContribution: number;
    paymentMethods: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
  };
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    fetchAnalytics();
  }, [isAuthenticated, navigate, user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/analytics?days=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`/admin/analytics/export?days=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${timeRange}days_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Export Complete",
        description: "Analytics data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.response?.data?.error || "Failed to export data",
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

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (!analyticsData && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data</h2>
            <p className="text-gray-600">Analytics data is not available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Platform Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into platform performance and user behavior
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAnalytics} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{analyticsData?.overview.totalUsers.toLocaleString()}</p>
                  <div className="text-sm">
                    {formatPercentage(analyticsData?.overview.growthMetrics.userGrowth || 0)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{analyticsData?.overview.totalCampaigns.toLocaleString()}</p>
                  <div className="text-sm">
                    {formatPercentage(analyticsData?.overview.growthMetrics.campaignGrowth || 0)}
                  </div>
                </div>
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
                <Skeleton className="h-7 w-32" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData?.overview.totalRaised || 0)}</p>
                  <div className="text-sm">
                    {formatPercentage(analyticsData?.overview.growthMetrics.revenueGrowth || 0)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div>
                  <p className="text-2xl font-bold">{analyticsData?.overview.totalContributions.toLocaleString()}</p>
                  <div className="text-sm">
                    {formatPercentage(analyticsData?.overview.growthMetrics.contributionGrowth || 0)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaigns by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Campaigns by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {analyticsData?.campaigns.byCategory.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{category.count} campaigns</p>
                        <p className="text-sm text-gray-600">{formatCurrency(category.totalRaised)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Campaign Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {analyticsData?.campaigns.byStatus.map((status, index) => (
                    <div key={status.status} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{status.status.replace('_', ' ')}</span>
                        <span>{status.count} ({status.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${status.percentage}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-4">
                  {analyticsData?.campaigns.topPerforming.map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-green-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{campaign.title}</p>
                          <p className="text-sm text-gray-600">{campaign.contributors} contributors</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(campaign.raised)}</p>
                        <p className="text-sm text-gray-600">
                          {((campaign.raised / campaign.goal) * 100).toFixed(1)}% funded
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Roles Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Active Users</p>
                    <p className="text-2xl font-bold">{analyticsData?.users.activeUsers.toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">By Role:</p>
                    {analyticsData?.users.byRole.map((role, index) => (
                      <div key={role.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {role.role === 'organization' ? (
                            <Building2 className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Users className="h-4 w-4 text-green-600" />
                          )}
                          <span className="capitalize">{role.role}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{role.count}</span>
                          <span className="text-sm text-gray-600 ml-2">({role.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contribution Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Contribution Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Average Contribution</h4>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData?.contributions.averageContribution || 0)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Payment Methods</h4>
                  <div className="space-y-2">
                    {analyticsData?.contributions.paymentMethods.map((method) => (
                      <div key={method.method} className="flex justify-between">
                        <span>{method.method}</span>
                        <span>{method.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Recent Trend</h4>
                  <div className="space-y-2">
                    {analyticsData?.contributions.dailyTrend.slice(-3).map((day) => (
                      <div key={day.date} className="flex justify-between text-sm">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <span>{formatCurrency(day.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
