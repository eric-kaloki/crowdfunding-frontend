import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { TopAppBar } from "@/components/TopAppBar";
import {URL} from '../utils/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from '@/utils/axiosConfig';

interface ProjectData {
  title: string;
  description: string;
  weeks_duration: string;
  application_type: 'web_app' | 'mobile_app' | 'both' | 'desktop_app';
  payment_structure: 'upfront' | 'milestone';
  prd_document?: File;
  budget?: number; // Optional since it will be set by admin
}

const SubmitProject: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPRDModal, setShowPRDModal] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    weeks_duration: '1',
    application_type: 'web_app',
    payment_structure: 'milestone',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentStructureChange = (value: 'upfront' | 'milestone') => {
    setProjectData(prev => ({
      ...prev,
      payment_structure: value
    }));
  };

  const handleApplicationTypeChange = (value: 'web_app' | 'mobile_app' | 'both' | 'desktop_app') => {
    setProjectData(prev => ({
      ...prev,
      application_type: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectData(prev => ({
        ...prev,
        prd_document: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate duration
      const duration = parseInt(projectData.weeks_duration);
      if (duration <= 0) {
        throw new Error('Project duration must be greater than 0 weeks');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('weeks_duration', duration.toString());
      formData.append('application_type', projectData.application_type);
      formData.append('payment_structure', projectData.payment_structure);
      formData.append('status', 'pending');
      
      if (projectData.prd_document) {
        formData.append('prd_document', projectData.prd_document);
      }

      await axiosInstance.post(`${URL}api/projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: "Project Submitted",
        description: "Your project has been successfully submitted for review.",
      });

      navigate('/client-dashboard');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || error.response?.data?.error || "Unable to submit project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PRDModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4 mt-16">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-w-[800px] h-[80vh] overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4">PRD Guidelines</h2>
        <div className="space-y-4">
          <p>Your PRD (Product Requirements Document) should include:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Project Overview:</strong> Detailed description including project name, core goal, target audience, and key business objectives.
            </li>
            <li>
              <strong>Scope and Deliverables:</strong> Comprehensive breakdown of what is included (in-scope) and excluded (out-of-scope), with a clear list of key project deliverables.
            </li>
            <li>
              <strong>Features and Functionality:</strong> Detailed feature specifications including:
              <ul className="list-circle pl-6">
                <li>Feature name and description</li>
                <li>User stories (format: "As a... I want to... so that...")</li>
                <li>Acceptance criteria</li>
                <li>Mockups or wireframes</li>
                <li>Feature dependencies</li>
                <li>Out-of-scope feature limitations</li>
              </ul>
            </li>
            <li>
              <strong>Technical Requirements:</strong> Platform compatibility, performance specs, security requirements, API integrations, and hosting details.
            </li>
            <li>
              <strong>Project Timeline and Milestones:</strong> Proposed timeline with key milestones and estimated completion dates.
            </li>
            <li>
              <strong>Budget Considerations:</strong> Required level of budget detail and financial constraints.
            </li>
            <li>
              <strong>Success Metrics:</strong> Quantifiable methods to measure project success and key performance indicators.
            </li>
            <li>
              <strong>Submission Guidelines:</strong> Preferred file formats, optional templates, and contact information for submissions.
            </li>
            <li>
              <strong>Review Process:</strong> Explanation of how submitted PRDs will be reviewed and evaluated.
            </li>
          </ul>
          <p>Please ensure your PRD is in PDF or Word document format and follows these guidelines.</p>
        </div>
        <Button 
          onClick={() => setShowPRDModal(false)}
          className="mt-4"
        >
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Project Title</label>
              <Input
                name="title"
                value={projectData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Description</label>
              <Textarea
                name="description"
                value={projectData.description}
                onChange={handleChange}
                placeholder="Describe your project requirements, goals, and any specific features you need (minimum 50 words)"
                required
                onBlur={(e) => {
                  const wordCount = e.target.value.trim().split(/\s+/).length;
                  if (wordCount < 50) {
                    e.target.setCustomValidity('Please provide a more detailed description (minimum 50 words)');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                className="h-32"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (Weeks)</label>
                <Input
                  type="number"
                  name="weeks_duration"
                  value={projectData.weeks_duration}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Application Type</label>
                <Select onValueChange={handleApplicationTypeChange} value={projectData.application_type}>
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                PRD Document
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setShowPRDModal(true)}
                >
                  View Guidelines
                </Button>
              </label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Structure</label>
              <Select onValueChange={handlePaymentStructureChange} value={projectData.payment_structure}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upfront">Upfront Payment</SelectItem>
                  <SelectItem value="milestone">Milestone-based Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Project"}
            </Button>
          </form>

          {showPRDModal && <PRDModal />}
        </div>
      </div>
    </div>
  );
};

export default SubmitProject;