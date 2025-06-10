import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { TopAppBar } from "@/components/TopAppBar";
import { Target, Upload, Calendar, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from '@/utils/axiosConfig';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignData {
  title: string;
  description: string;
  funding_goal: string;
  end_date: string;
  category: string;
  campaign_image?: File;
}

const CATEGORIES = [
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

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: '',
    description: '',
    funding_goal: '',
    end_date: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setCampaignData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCampaignData(prev => ({
        ...prev,
        campaign_image: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!campaignData.title.trim()) {
        throw new Error('Campaign title is required');
      }
      if (!campaignData.description.trim() || campaignData.description.trim().length < 50) {
        throw new Error('Campaign description must be at least 50 characters');
      }
      if (!campaignData.funding_goal || parseFloat(campaignData.funding_goal) <= 0) {
        throw new Error('Funding goal must be greater than 0');
      }
      if (!campaignData.end_date) {
        throw new Error('Campaign end date is required');
      }
      if (!campaignData.category) {
        throw new Error('Campaign category is required');
      }

      // Validate end date is in the future
      const endDate = new Date(campaignData.end_date);
      const today = new Date();
      if (endDate <= today) {
        throw new Error('Campaign end date must be in the future');
      }

      // Validate end date is not more than 1 year from now
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (endDate > oneYearFromNow) {
        throw new Error('Campaign duration cannot exceed 1 year');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', campaignData.title.trim());
      formData.append('description', campaignData.description.trim());
      formData.append('funding_goal', campaignData.funding_goal);
      formData.append('end_date', campaignData.end_date);
      formData.append('category', campaignData.category);
      
      if (campaignData.campaign_image) {
        formData.append('campaign_image', campaignData.campaign_image);
      }

      const response = await axiosInstance.post('/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Campaign Created Successfully!",
        description: "Your campaign has been submitted and is pending approval.",
      });

      // Navigate to dashboard based on user role
      if (user?.role === 'organization') {
        navigate('/organization-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Campaign Creation Failed",
        description: error.message || error.response?.data?.error || "Unable to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum is tomorrow
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Maximum is 1 year from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
            <p className="text-muted-foreground">
              Share your vision and start raising funds for your cause
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Title *</label>
              <Input
                name="title"
                value={campaignData.title}
                onChange={handleChange}
                placeholder="Enter a compelling campaign title"
                required
                maxLength={100}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                {campaignData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Campaign Description *</label>
              <Textarea
                name="description"
                value={campaignData.description}
                onChange={handleChange}
                placeholder="Tell your story and explain why people should support your campaign (minimum 50 words)"
                required
                disabled={isLoading}
                className="h-32"
                onBlur={(e) => {
                  const wordCount = e.target.value.trim().split(/\s+/).length;
                  if (wordCount < 50) {
                    e.target.setCustomValidity('Please provide a more detailed description (minimum 50 words)');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                Word count: {campaignData.description.trim().split(/\s+/).filter(word => word.length > 0).length}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Funding Goal (KES) *</label>
                <Input
                  type="number"
                  name="funding_goal"
                  value={campaignData.funding_goal}
                  onChange={handleChange}
                  placeholder="10000"
                  min="1000"
                  max="10000000"
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: KES 1,000
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Campaign End Date *</label>
                <Input
                  type="date"
                  name="end_date"
                  value={campaignData.end_date}
                  onChange={handleChange}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select value={campaignData.category} onValueChange={handleCategoryChange} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Campaign Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload an image to make your campaign more appealing (JPG, PNG, max 5MB)
              </p>
              {campaignData.campaign_image && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Image selected: {campaignData.campaign_image.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📋 Before You Submit</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure your campaign follows our community guidelines</li>
                <li>• Your campaign will be reviewed by our team before going live</li>
                <li>• Review process typically takes 24-48 hours</li>
                <li>• You'll receive an email notification when your campaign is approved</li>
              </ul>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
