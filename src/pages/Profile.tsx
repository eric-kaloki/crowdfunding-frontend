import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  Shield, 
  Verified,
  Camera,
  Mail,
  Phone,
  Building,
  User
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/ProfileHeader';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  verification_status: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  created_at: string;
  organization?: {
    id: string;
    organization_name: string;
    organization_description: string;
    organization_registration_number?: string;
    approval_status: string;
    registration_certificate_url?: string;
  };
}

interface EditableFields {
  name: string;
  phone: string;
  bio: string;
  location: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedFields, setEditedFields] = useState<EditableFields>({
    name: '',
    phone: '',
    bio: '',
    location: ''
  });

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const endpoint = isOwnProfile 
        ? '/auth/profile/me' 
        : `/auth/profile/${userId}`;
      
      console.log('Fetching profile from:', endpoint);
      
      const response = await axiosInstance.get(endpoint);
      console.log('Profile response:', response.data);
      
      setProfile(response.data);
      
      // Initialize editable fields only for own profile
      if (isOwnProfile) {
        setEditedFields({
          name: response.data.name || '',
          phone: response.data.phone || '',
          bio: response.data.bio || '',
          location: response.data.location || ''
        });
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      const errorMessage = error.response?.data?.error || "Failed to load profile";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (error.response?.status === 404) {
        navigate('/client-dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setEditedFields({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await axiosInstance.patch('/auth/profile/me', editedFields);
      
      setProfile(prev => prev ? { ...prev, ...response.data } : null);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditableFields, value: string) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Profile Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The profile you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/client-dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onProfileUpdate={setProfile}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  {isEditing && isOwnProfile ? (
                    <Input
                      value={editedFields.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-base">{profile.name}</p>
                  )}
                </div>

                {/* Email - Only show for own profile */}
                {isOwnProfile && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{profile.email}</p>
                      {profile.verification_status === 'verified' && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                )}

                {/* Phone - Only show for own profile */}
                {isOwnProfile && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    {isEditing ? (
                      <Input
                        value={editedFields.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-base">{profile.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  {isEditing && isOwnProfile ? (
                    <Textarea
                      value={editedFields.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  ) : (
                    <p className="text-base text-gray-700">
                      {profile.bio || (isOwnProfile ? 'No bio added yet.' : 'No bio available.')}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  {isEditing && isOwnProfile ? (
                    <Input
                      value={editedFields.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-base">{profile.location || 'Not specified'}</p>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-base">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Information - Show for organization profiles */}
            {profile.role === 'organization' && profile.organization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Organization Name</label>
                    <p className="text-base font-medium">{profile.organization.organization_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-base text-gray-700">{profile.organization.organization_description}</p>
                  </div>

                  {/* Only show registration details for own profile */}
                  {isOwnProfile && profile.organization.organization_registration_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Number</label>
                      <p className="text-base">{profile.organization.organization_registration_number}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          profile.organization.approval_status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : profile.organization.approval_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {profile.organization.approval_status}
                      </Badge>
                      {profile.organization.approval_status === 'approved' && (
                        <Shield className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.role === 'admin' ? 'destructive' : 'default'}>
                      {profile.role === 'admin' ? 'Administrator' : 
                       profile.role === 'organization' ? 'Organization' : 'Individual'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Verification Status</label>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        profile.verification_status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {profile.verification_status}
                    </Badge>
                    {profile.verification_status === 'verified' && (
                      <Verified className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/settings')}
                    >
                      Account Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Summary (placeholder for future features) */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Campaigns created: Coming soon</p>
                  <p>• Contributions made: Coming soon</p>
                  <p>• Comments posted: Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
