import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { TopAppBar } from "@/components/TopAppBar";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils";
import axiosInstance from '@/utils/axiosConfig';
import PaymentDialog from './PaymentInterface';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  tech_stack?: string[];
  payment_structure?: string;
  timeline?: number;
  created_at: string;
  client: {
    id: string;
    name: string;
  };
}

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axiosInstance.get(`/projects/${id}`);
        setProject(response.data);

        // Redirect if project is not completed
        if (response.data.status !== 'completed') {
          toast({
            title: "Payment Not Available",
            description: "This project is not ready for payment yet.",
            variant: "destructive"
          });
          navigate(`/projects/${id}`);
          return;
        }

        // Redirect if user is not the project client
        if (user?.role !== 'client' || response.data.client.id !== user?.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to pay for this project.",
            variant: "destructive"
          });
          navigate(`/projects/${id}`);
          return;
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Could not fetch project details",
          variant: "destructive"
        });
        navigate('/projects');
      }
    };

    fetchProject();
  }, [id, navigate, toast, user]);

  if (!project) {
    return null;
  }

  return (
    <div>
      <TopAppBar />
      <div className="container py-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold">{project.title}</h2>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
              <Button 
                onClick={() => setIsPaymentDialogOpen(true)}
                variant="default"
              >
                Pay for Project
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="font-medium mb-1">Client</h3>
                <p className="text-muted-foreground">
                  {project.client.name}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Budget</h3>
                <p className="text-muted-foreground">
                  {formatCurrency(project.budget)}
                </p>
              </div>
              {project.timeline && (
                <div>
                  <h3 className="font-medium mb-1">Timeline</h3>
                  <p className="text-muted-foreground">
                    {project.timeline} days
                  </p>
                </div>
              )}
              {project.payment_structure && (
                <div>
                  <h3 className="font-medium mb-1">Payment Structure</h3>
                  <p className="text-muted-foreground">
                    {project.payment_structure.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>

            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech, index) => (
                    <div key={index} className="bg-muted text-sm px-2 py-1 rounded">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <PaymentDialog
          projectId={project.id}
          amount={project.budget}
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
