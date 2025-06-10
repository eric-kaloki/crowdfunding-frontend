import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from '@/utils/axiosConfig';

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    verification_status: string;
    profile_picture?: string;
  };
  isOwnProfile: boolean;
  onProfileUpdate: (updatedProfile: any) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isOwnProfile, 
  onProfileUpdate 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('profilePicture', file);

      console.log('Uploading file:', file.name, file.type, file.size);

      const response = await axiosInstance.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      console.log('Upload response:', response.data);

      // Update the profile with new picture
      onProfileUpdate({
        ...profile,
        profile_picture: response.data.profile_picture
      });

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });

      // Clear the input
      event.target.value = '';

    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Construct the full image URL with error handling
  const getImageUrl = (profilePicture?: string) => {
    if (!profilePicture) return null;
    
    // If it's already a full URL, return as is
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    // Construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${profilePicture}`;
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {profile.profile_picture ? (
              <AvatarImage 
                src={getImageUrl(profile.profile_picture)}
                alt={profile.name}
                onError={(e) => {
                  console.error('Image load error for URL:', getImageUrl(profile.profile_picture));
                  // Hide the broken image and show fallback
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', getImageUrl(profile.profile_picture));
                }}
              />
            ) : null}
            <AvatarFallback className="text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          
          {isOwnProfile && (
            <div className="absolute bottom-0 right-0">
              <label htmlFor="profile-picture-upload">
                <Button
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  disabled={uploading}
                  asChild
                >
                  <div className="cursor-pointer">
                    {uploading ? (
                      <Upload className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {profile.role === 'admin' ? 'Administrator' : 
               profile.role === 'organization' ? 'Organization' : 'Individual'}
            </span>
            {profile.verification_status === 'verified' && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
