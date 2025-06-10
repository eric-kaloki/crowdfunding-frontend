import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  Heart, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Shield,
  DollarSign,
  Eye
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

interface AdminStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  fundedCampaigns: number;
  totalFundsRaised: number;
  totalUsers: number;
  totalOrganizations: number;
  pendingOrganizations: number;
  recentActivity: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    type: 'campaign' | 'user' | 'contribution';
  }[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingCampaigns: 0,
    fundedCampaigns: 0,
    totalFundsRaised: 0,
    totalUsers: 0,
    totalOrganizations: 0,
    pendingOrganizations: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setStats(response.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load admin stats",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, navigate, user]);

  if (!user) {
    return null;
  }

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'contribution':
        return <Heart className="h-4 w-4 text-pink-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-2 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Crowdfunding Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor platform performance and manage the crowdfunding ecosystem
          </p>
        </div>

        {/* Stats Overview - Enhanced Mobile Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Campaigns
              </CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {loading ? (
                <Skeleton className="h-6 sm:h-7 w-12 sm:w-16" />
              ) : (
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalCampaigns}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stats.activeCampaigns} active
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Funds Raised
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {loading ? (
                <Skeleton className="h-6 sm:h-7 w-16 sm:w-24" />
              ) : (
                <div>
                  <p className="text-lg sm:text-2xl font-bold">
                    {formatCurrency(stats.totalFundsRaised)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stats.fundedCampaigns} successful
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Platform Users
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {loading ? (
                <Skeleton className="h-6 sm:h-7 w-12 sm:w-16" />
              ) : (
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stats.totalOrganizations} orgs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {loading ? (
                <Skeleton className="h-6 sm:h-7 w-12 sm:w-16" />
              ) : (
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.pendingCampaigns + stats.pendingOrganizations}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stats.pendingOrganizations} orgs pending
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Recent Platform Activity
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <Skeleton className="h-12 sm:h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{activity.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {activity.type === "campaign"
                              ? "Campaign"
                              : activity.type === "user"
                              ? "User Registration"
                              : "New Contribution"}{" "}
                            • Status: {activity.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-muted-foreground text-sm sm:text-base">No recent activity</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Admin Controls - Mobile Grid */}
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Platform Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Manage user accounts, verify organizations, and handle user
                permissions.
              </p>
              <Link to="/admin/users" className="block">
                <Button className="w-full text-sm">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                Organization Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Review and approve organization registrations and certificates.
              </p>
              <Link to="/admin/organizations" className="block">
                <Button variant="outline" className="w-full text-sm">
                  Review Organizations ({stats.pendingOrganizations})
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Campaign Oversight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Monitor all campaigns from organizations and individuals, review
                content, and ensure platform quality.
              </p>
              <Link to="/admin/campaigns" className="block">
                <Button variant="outline" className="w-full text-sm">
                  View All Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                Pending Campaign Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Review and approve campaigns awaiting verification before they
                go live.
              </p>
              <Link to="/admin/pending-campaigns" className="block">
                <Button variant="outline" className="w-full text-sm">
                  Review Campaigns ({stats.pendingCampaigns})
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                Campaign Contributions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Monitor crowdfunding donations, M-Pesa transactions, and
                supporter contributions.
              </p>
              <Link to="/admin/contributions" className="block">
                <Button variant="outline" className="w-full text-sm">
                  Manage Donations
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                View detailed platform analytics and performance metrics.
              </p>
              <Link to="/admin/analytics" className="block">
                <Button variant="outline" className="w-full text-sm">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Configure platform settings, fees, and security policies.
              </p>
              <Link to="/admin/settings" className="block">
                <Button variant="outline" className="w-full text-sm">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;