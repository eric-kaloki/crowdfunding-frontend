import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {URL} from '../utils/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  status: string;
  application_type: 'web_app' | 'mobile_app' | 'both' | 'desktop_app';
  payment_structure: string;
  weeks_duration: number;
  prd_document_url?: string;
  tech_stack?: string[];
  encrypted_source_code?: string;
  source_code_key?: string;
  created_at: string;
  client: {
    id: string;
    name: string;
  };
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});
  const [newPrdDocument, setNewPrdDocument] = useState<File | null>(null);
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  const [sourceCodeKey, setSourceCodeKey] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const endpoint = isAdmin ? `api/admin/projects/${id}` : `api/projects/${id}`;
        const response = await axiosInstance.get(`${URL}${endpoint}`);
        setProject(response.data);
        setSourceCodeUrl(response.data.encrypted_source_code || '');
        setSourceCodeKey(response.data.source_code_key || '');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load project details",
          variant: "destructive"
        });
        navigate(isAdmin ? '/admin/projects' : '/client-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, isAuthenticated, navigate, isAdmin]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await axiosInstance.patch(`${URL}api/admin/projects/${id}`, {
        status: newStatus,
        encrypted_source_code: sourceCodeUrl,
        source_code_key: sourceCodeKey
      });
      
      setProject(response.data);
      toast({
        title: "Success",
        description: "Project has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update project",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    setEditedProject({
      title: project?.title,
      description: project?.description,
      weeks_duration: project?.weeks_duration,
      application_type: project?.application_type,
      payment_structure: project?.payment_structure,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject({});
    setNewPrdDocument(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPrdDocument(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Append all edited fields
      Object.entries(editedProject).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append new PRD document if exists
      if (newPrdDocument) {
        formData.append('prd_document', newPrdDocument);
      }

      const response = await axiosInstance.patch(`${URL}api/projects/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProject(response.data);
      setIsEditing(false);
      setEditedProject({});
      setNewPrdDocument(null);
      
      toast({
        title: "Success",
        description: "Project has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update project",
        variant: "destructive"
      });
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KSH'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'paid':
        return 'bg-purple-500/10 text-purple-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopAppBar />
        <div className="container mx-auto p-6">
          <Skeleton className="h-8 w-64 mb-8" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex gap-2 items-center">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
            {(isAdmin || user?.id === project.client.id) && !isEditing && (project.status === 'pending') && (
              <Button onClick={handleEdit}>Edit Project</Button>
            )}
            {isEditing && (project.status === 'pending' || project.status === 'in_progress') && (
              <>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedProject.description || ''}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] p-2 border rounded"
                />
              ) : (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium mb-1">Duration (Weeks)</h3>
                {isEditing ? (
                  <Input
                    type="number"
                    name="weeks_duration"
                    value={editedProject.weeks_duration || ''}
                    onChange={handleInputChange}
                    min="1"
                  />
                ) : (
                  <p className="text-muted-foreground">{project.weeks_duration} weeks</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">Application Type</h3>
                {isEditing ? (
                  <Select
                    value={editedProject.application_type}
                    onValueChange={(value) => handleSelectChange('application_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web_app">Web Application</SelectItem>
                      <SelectItem value="mobile_app">Mobile Application</SelectItem>
                      <SelectItem value="both">Web & Mobile Application</SelectItem>
                      <SelectItem value="desktop_app">Desktop Application</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-muted-foreground">
                    {project.application_type ? project.application_type
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ') : ''}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">Payment Structure</h3>
                {isEditing ? (
                  <Select
                    value={editedProject.payment_structure}
                    onValueChange={(value) => handleSelectChange('payment_structure', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment structure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upfront">Upfront Payment</SelectItem>
                      <SelectItem value="milestone">Milestone-based Payment</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-muted-foreground">
                    {project.payment_structure?.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div>
                <h3 className="font-medium mb-1">Update PRD Document</h3>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current document: {project.prd_document_url ? 'Uploaded' : 'None'}
                </p>
              </div>
            )}

            {!isEditing && project.prd_document_url && (
              <div>
                <h3 className="font-medium mb-1">PRD Document</h3>
                <a
                  href={project.prd_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Document
                </a>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {(project.tech_stack || []).map((tech, index) => (
                  <Badge key={index} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>

            {project.encrypted_source_code && project.source_code_key && (
              <div>
               {/* Source Code Section */}
               <h3 className="font-medium mb-2">Source Code</h3>
               <div className={`grid gap-2 relative ${!isAdmin && project.status !== 'paid' ? 'blur-sm select-none' : ''}`}>
                 {/* Overlay for non-admin users */}
                 {!isAdmin && project.status !== 'completed' && (
                   <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                     <p className="text-muted-foreground">Source code is available once the project is completed</p>
                   </div>
                 )}
                 <div className="relative z-0">
                   <p className="text-sm text-muted-foreground mb-1">Repository URL:</p>
                   <p className="font-mono bg-muted p-2 rounded">{project.encrypted_source_code}</p>
                 </div>
               </div> 
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                {!isAdmin && project.status === 'completed' || !isAdmin&&project.payment_structure === 'upfront' ? (
                  <Button onClick={() => navigate(`/payment/${project.id}`)} variant="default">Pay for Project</Button>
                ) : (
                  <p className="text-muted-foreground">Payment is not required for this project</p>
                )}
               
              </div>
              {isAdmin && (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm mb-1 block">Source Code URL</label>
                    <Input value={sourceCodeUrl} onChange={(e) => setSourceCodeUrl(e.target.value)} placeholder="Enter source code URL" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm mb-1 block">Source Code Access Key</label>
                    <Input value={sourceCodeKey} onChange={(e) => setSourceCodeKey(e.target.value)} placeholder="Enter access key" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={project.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => handleStatusChange(project.status)} disabled={!sourceCodeUrl || !sourceCodeKey}>Update Project</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;
