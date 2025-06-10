import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TopAppBar } from "@/components/TopAppBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import PaymentDialog from './PaymentInterface';

// Project interface to define the structure of a project
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  tech_stack: string[];
  deliverables: string[];
  created_at: string;
  timeline?: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Payment-related states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState<Project | null>(null);

  // Helper function to get badge variant based on project status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your projects.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/projects/client-projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProjects(response.data);
        setIsLoading(false);
      } catch (error: any) {
        
        toast({
          title: "Error Fetching Projects",
          description: error.response?.data?.error || "Unable to retrieve projects.",
          variant: "destructive"
        });

        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle project edit submission
  const handleEditProject = async () => {
    if (!selectedProject || !editingProject) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/projects/${selectedProject.id}`, 
        {
          ...editingProject,
          timeline: editingProject.timeline || null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the project in the list
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === selectedProject.id 
            ? { ...project, ...response.data.project } 
            : project
        )
      );

      // Update the selected project
      setSelectedProject(response.data.project);

      toast({
        title: "Project Updated",
        description: "Project details have been successfully updated.",
        variant: "default"
      });

      setIsEditing(false);
    } catch (error: any) {
      
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Unable to update project.",
        variant: "destructive"
      });
    }
  };

  // Handle opening payment dialog
  const handleOpenPaymentDialog = (project: Project) => {
    setSelectedProjectForPayment(project);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div>
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Link to="/submit-project">
            <Button>Create New Project</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No projects found. 
            <Link to="/submit-project" className="ml-2 text-primary underline">
              Create your first project
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedProject(project)}
                >
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>KSH{project.budget?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Project Details Dialog */}
        <Dialog 
          open={!!selectedProject} 
          onOpenChange={() => {
            setSelectedProject(null);
            setIsEditing(false);
          }}
        >
          <DialogContent className="max-w-2xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  {isEditing ? (
                    <Input 
                      value={editingProject?.title || selectedProject.title}
                      onChange={(e) => setEditingProject(prev => ({ 
                        ...prev, 
                        title: e.target.value 
                      }))}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <DialogTitle>{selectedProject.title}</DialogTitle>
                  )}
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    {isEditing ? (
                      <Textarea
                        value={editingProject?.description || selectedProject.description}
                        onChange={(e) => setEditingProject(prev => ({ 
                          ...prev, 
                          description: e.target.value 
                        }))}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {selectedProject.description}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Tech Stack</h3>
                    {isEditing ? (
                      <Input
                        value={(editingProject?.tech_stack || selectedProject.tech_stack)?.join(', ')}
                        onChange={(e) => setEditingProject(prev => ({ 
                          ...prev, 
                          tech_stack: e.target.value.split(',').map(t => t.trim()) 
                        }))}
                        placeholder="Enter tech stack, separated by commas"
                      />
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {selectedProject.tech_stack?.map((tech: string) => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Duration</h3>
                      {isEditing ? (
                        <Input
                          value={editingProject?.timeline || selectedProject.timeline || ''}
                          onChange={(e) => setEditingProject(prev => ({ 
                            ...prev, 
                            timeline: e.target.value 
                          }))}
                          placeholder="Enter project duration"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {selectedProject.timeline || 'Not specified'}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Budget</h3>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingProject?.budget || selectedProject.budget}
                          onChange={(e) => setEditingProject(prev => ({ 
                            ...prev, 
                            budget: parseFloat(e.target.value) 
                          }))}
                          placeholder="Enter project budget"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          ${selectedProject.budget?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Deliverables</h3>
                    {isEditing ? (
                      <Input
                        value={(editingProject?.deliverables || selectedProject.deliverables)?.join(', ')}
                        onChange={(e) => setEditingProject(prev => ({ 
                          ...prev, 
                          deliverables: e.target.value.split(',').map(t => t.trim()) 
                        }))}
                        placeholder="Enter deliverables, separated by commas"
                      />
                    ) : (
                      <ul className="list-disc list-inside text-muted-foreground">
                        {selectedProject.deliverables?.map((item: string) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingProject(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEditProject}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingProject({
                            id: selectedProject.id,
                            title: selectedProject.title,
                            description: selectedProject.description,
                            tech_stack: selectedProject.tech_stack,
                            deliverables: selectedProject.deliverables,
                            budget: selectedProject.budget,
                            timeline: selectedProject.timeline
                          });
                        }}
                      >
                        Edit Project
                      </Button>
                      <Button 
                        onClick={() => handleOpenPaymentDialog(selectedProject)}
                        disabled={selectedProject.status !== 'approved'}
                      >
                        Pay for Project
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        {selectedProjectForPayment && (
          <PaymentDialog 
            projectId={selectedProjectForPayment.id}
            amount={selectedProjectForPayment.budget}
            isOpen={isPaymentDialogOpen}
            onClose={() => {
              setIsPaymentDialogOpen(false);
              setSelectedProjectForPayment(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;