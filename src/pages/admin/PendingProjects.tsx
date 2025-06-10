import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopAppBar } from "@/components/TopAppBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { URL } from '../../utils/shared';
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
  budget: number;
  status: string;
  tech_stack: string[];
  payment_structure: string;
  timeline: number;
  created_at: string;
  client: {
    id: string;
    name: string;
  };
}

const PendingProjects = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchProjects = async () => {
      try {
        console.log('Fetching pending projects from:', `${URL}api/projects/pending-review`);
        console.log('User:', user);
        console.log('Authenticated:', isAuthenticated);
        console.log('Request headers:', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const response = await axios.get(`${URL}api/projects/pending-review`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('User authentication state:', {
          isAuthenticated,
          user,
        });
        // Filter only pending projects
        const pendingProjects = response.data.filter((p: Project) => p.status === 'pending');
        setProjects(pendingProjects);
      } catch (error: any) {
        console.log('Error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load projects",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, navigate, user]);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token
      console.log('Updating project status with token:', token); // Log the token for debugging
  
      const response = await axios.patch(`${URL}api/admin/projects/${projectId}`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
  
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
  
      toast({
        title: "Status Updated",
        description: `Project status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update project status",
        variant: "destructive"
      });
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KSH'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Pending Projects Review</h1>

        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant="outline">Pending Review</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Client</p>
                        <p>{project.client.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p>{formatCurrency(project.budget)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timeline</p>
                        <p>{project.timeline} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{formatDate(project.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-2">
                      <Select
                        onValueChange={(value) => handleStatusChange(project.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">Approve & Start</SelectItem>
                          <SelectItem value="rejected">Reject Project</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Link to={`/admin/projects/${project.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No pending projects found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingProjects;
