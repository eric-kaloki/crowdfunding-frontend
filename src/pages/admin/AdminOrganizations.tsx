import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Users, 
  Eye, 
  Check, 
  X, 
  ExternalLink,
  Building,
  Phone,
  Mail,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TopAppBar } from "@/components/TopAppBar";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/utils/axiosConfig';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Organization {
  id: string;
  organization_name: string;
  organization_description: string;
  organization_registration_number: string;
  contact_person: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  registration_certificate_url?: string;
  created_at: string;
  approval_notes?: string;
  approved_at?: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  };
}

const AdminOrganizations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/client-dashboard');
      return;
    }

    fetchOrganizations();
  }, [isAuthenticated, navigate, user]);

  const fetchOrganizations = async () => {
    try {
      const response = await axiosInstance.get('/admin/organizations');
      setOrganizations(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org);
    setIsDetailsModalOpen(true);
  };

  const handleApprovalAction = (org: Organization, action: 'approve' | 'reject') => {
    setSelectedOrg(org);
    setApprovalNotes('');
    setCurrentAction(action);
    setIsApprovalModalOpen(true);
  };

  const submitApproval = async () => {
    if (!selectedOrg || !currentAction) return;

    // Validate that approval notes are provided for rejection
    if (currentAction === 'reject' && !approvalNotes.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback explaining why this organization is being rejected.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingApproval(true);
      
      const payload = {
        approval_status: currentAction === 'approve' ? 'approved' : 'rejected',
        approval_notes: approvalNotes.trim() || undefined
      };

      await axiosInstance.patch(`/admin/organizations/${selectedOrg.id}/approval`, payload);

      // Update local state
      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrg.id 
          ? { 
              ...org, 
              approval_status: currentAction === 'approve' ? 'approved' : 'rejected',
              approval_notes: approvalNotes.trim() 
            }
          : org
      ));

      toast({
        title: `Organization ${currentAction === 'approve' ? 'approved' : 'rejected'}`,
        description: `${selectedOrg.organization_name} has been ${currentAction === 'approve' ? 'approved' : 'rejected'}. A notification email has been sent to the organization.`,
      });

      setIsApprovalModalOpen(false);
      setSelectedOrg(null);
      setApprovalNotes('');
      setCurrentAction(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${currentAction} organization`,
        variant: "destructive",
      });
    } finally {
      setProcessingApproval(false);
    }
  };

  const handleModalClose = () => {
    setIsApprovalModalOpen(false);
    setSelectedOrg(null);
    setApprovalNotes('');
    setCurrentAction(null);
  };

  const filteredOrganizations = organizations.filter(org => {
    if (statusFilter === 'all') return true;
    return org.approval_status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            Review and approve organization registrations
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'outline'}
              onClick={() => setStatusFilter(filter)}
              size="sm"
            >
              {filter === 'all' ? 'All Organizations' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {/* Organizations List */}
        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader onClick={() => handleViewDetails(org)}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                          {org.organization_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Contact: {org.contact_person}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(org.approval_status)}>
                        {org.approval_status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(org);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Organization Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {org.organization_description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span>Reg. Number: {org.organization_registration_number || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Applied: {formatDate(org.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{org.profiles.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{org.profiles.email}</span>
                          </div>
                          {org.profiles.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{org.profiles.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {org.approval_status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprovalAction(org, 'approve');
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprovalAction(org, 'reject');
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No organizations found for the selected filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Organization Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-6 w-6 text-blue-600" />
                {selectedOrg?.organization_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(selectedOrg?.approval_status || '')}>
                  {selectedOrg?.approval_status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Applied on {selectedOrg ? formatDate(selectedOrg.created_at) : ''}
                </span>
              </div>
            </DialogHeader>
            
            {selectedOrg && (
              <div className="space-y-6 mt-4">
                {/* Organization Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Organization Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Organization Name</label>
                          <p className="text-base">{selectedOrg.organization_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-base text-gray-700">{selectedOrg.organization_description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Registration Number</label>
                          <p className="text-base">{selectedOrg.organization_registration_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Contact Person</label>
                          <p className="text-base">{selectedOrg.contact_person}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">Account Holder</label>
                            <p className="text-base">{selectedOrg.profiles.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                            <p className="text-base">{selectedOrg.profiles.email}</p>
                          </div>
                        </div>
                        {selectedOrg.profiles.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <label className="text-sm font-medium text-gray-500">Phone Number</label>
                              <p className="text-base">{selectedOrg.profiles.phone}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">Account Created</label>
                            <p className="text-base">{formatDate(selectedOrg.profiles.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Certificate */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Registration Certificate</h3>
                  {selectedOrg.registration_certificate_url ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600 mb-3">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Certificate Available</span>
                      </div>
                      
                      {/* Certificate Preview/View */}
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Registration Certificate</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(selectedOrg.registration_certificate_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Full Size
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = selectedOrg.registration_certificate_url!;
                                link.download = `${selectedOrg.organization_name}_certificate`;
                                link.click();
                              }}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        {/* Certificate iframe or image preview */}
                        <div className="border rounded-lg overflow-hidden bg-white">
                          {selectedOrg.registration_certificate_url.toLowerCase().includes('.pdf') ? (
                            <iframe
                              src={selectedOrg.registration_certificate_url}
                              className="w-full h-96"
                              title="Registration Certificate"
                            />
                          ) : (
                            <img
                              src={selectedOrg.registration_certificate_url}
                              alt="Registration Certificate"
                              className="w-full h-96 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'block';
                              }}
                            />
                          )}
                          <div className="hidden p-8 text-center text-gray-500">
                            <p>Unable to preview certificate. Please use the "View Full Size" button above.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">No Certificate Uploaded</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        This organization has not uploaded their registration certificate yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons for All Organizations */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Administrative Actions</h3>
                  
                  {selectedOrg.approval_status === 'pending' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-3">
                        Review the organization details and certificate above, then choose an action:
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            handleApprovalAction(selectedOrg, 'approve');
                          }}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Organization
                        </Button>
                        <Button
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            handleApprovalAction(selectedOrg, 'reject');
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-3">
                        Current status: <strong>{selectedOrg.approval_status}</strong>. You can change the status if needed:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedOrg.approval_status !== 'approved' && (
                          <Button
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              handleApprovalAction(selectedOrg, 'approve');
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {selectedOrg.approval_status !== 'rejected' && (
                          <Button
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              handleApprovalAction(selectedOrg, 'reject');
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        
                        {selectedOrg.approval_status !== 'pending' && (
                          <Button
                            onClick={() => {
                              setIsDetailsModalOpen(false);
                              handleApprovalAction({...selectedOrg, approval_status: 'pending'}, 'approve');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Reset to Pending
                          </Button>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> Changing the status will send an automatic email notification to the organization with your feedback.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Approval History */}
                {(selectedOrg.approval_status === 'approved' || selectedOrg.approval_status === 'rejected') && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Approval History</h3>
                    <div className={`p-4 rounded-lg border ${
                      selectedOrg.approval_status === 'approved' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedOrg.approval_status === 'approved' ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          selectedOrg.approval_status === 'approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Organization {selectedOrg.approval_status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      
                      {selectedOrg.approved_at && (
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedOrg.approval_status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {formatDate(selectedOrg.approved_at)}
                        </p>
                      )}
                      
                      {selectedOrg.approval_notes && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-600">
                            Admin {selectedOrg.approval_status === 'approved' ? 'Notes' : 'Feedback'}:
                          </label>
                          <div className="bg-white p-3 rounded border mt-1">
                            <p className="text-sm text-gray-700">{selectedOrg.approval_notes}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          💡 An email notification was automatically sent to the organization when this status was set.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Modal */}
        <Dialog open={isApprovalModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {currentAction === 'approve' ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    Approve Organization
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    Reject Organization
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {currentAction === 'approve' 
                  ? `You are about to approve "${selectedOrg?.organization_name}". This will grant them access to create campaigns.`
                  : `You are about to reject "${selectedOrg?.organization_name}". Please provide detailed feedback to help them improve their application.`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {currentAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Feedback (Required)'}
                </label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={
                    currentAction === 'approve' 
                      ? "Add any notes about this approval (optional)..."
                      : "Explain why this organization is being rejected and what they need to fix..."
                  }
                  rows={4}
                  className={currentAction === 'reject' && !approvalNotes.trim() ? 'border-red-300' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This feedback will be included in the email notification to the organization.
                </p>
                {currentAction === 'reject' && !approvalNotes.trim() && (
                  <p className="text-xs text-red-600 mt-1">
                    Feedback is required when rejecting an organization
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleModalClose}
                  variant="outline"
                  disabled={processingApproval}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApproval}
                  disabled={processingApproval || (currentAction === 'reject' && !approvalNotes.trim())}
                  className={currentAction === 'approve' 
                    ? "bg-green-600 hover:bg-green-700 flex-1" 
                    : "bg-red-600 hover:bg-red-700 flex-1"
                  }
                >
                  {currentAction === 'approve' ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {processingApproval ? 'Approving...' : 'Approve Organization'}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      {processingApproval ? 'Rejecting...' : 'Reject Organization'}
                    </>
                  )}
                </Button>
              </div>
              
              {/* Visual feedback for current action */}
              <div className={`p-3 rounded-lg border ${
                currentAction === 'approve' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-xs ${
                  currentAction === 'approve' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {currentAction === 'approve' 
                    ? '✅ This organization will be approved and can start creating campaigns.'
                    : '❌ This organization will be rejected and will need to address the feedback before reapplying.'
                  }
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminOrganizations;
