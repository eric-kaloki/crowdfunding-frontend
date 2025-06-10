import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import axiosInstance from '../utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from '@/components/Header';
import { useToast } from "@/components/ui/use-toast";
import { TermsModal } from "@/components/TermsModal";
import GoogleAuthButton from '@/components/GoogleAuthButton';

// Enhanced Signup Form Schema
const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(['user', 'organization']).default('user'),
  // Organization fields (conditional)
  organizationName: z.string().optional(),
  organizationDescription: z.string().optional(),
  registrationNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'organization') {
    return data.organizationName && data.organizationName.trim().length > 0;
  }
  return true;
}, {
  message: "Organization name is required for organization accounts",
  path: ["organizationName"],
}).refine((data) => {
  if (data.role === 'organization') {
    return data.organizationDescription && data.organizationDescription.trim().length > 0;
  }
  return true;
}, {
  message: "Organization description is required for organization accounts",
  path: ["organizationDescription"],
});

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();
  const [userType, setUserType] = useState<'user' | 'organization'>('user');

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "user",
      organizationName: "",
      organizationDescription: "",
      registrationNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please read and accept the terms and conditions to continue.",
        variant: "destructive",
      });
      setTermsModalOpen(true);
      return;
    }

    // Additional client-side validation for organization fields
    if (values.role === 'organization') {
      if (!values.organizationName?.trim()) {
        form.setError('organizationName', { message: 'Organization name is required' });
        return;
      }
      if (!values.organizationDescription?.trim()) {
        form.setError('organizationDescription', { message: 'Organization description is required' });
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
        ...(values.role === 'organization' && {
          organizationData: {
            organizationName: values.organizationName?.trim(),
            organizationDescription: values.organizationDescription?.trim(),
            registrationNumber: values.registrationNumber?.trim() || null,
            contactPerson: values.name.trim(),
          }
        })
      };

      console.log('Submitting registration payload...');

      // Show processing toast for long requests
      const processingToast = toast({
        title: "Creating account...",
        description: "Please wait while we set up your account.",
        duration: 15000, // 15 seconds
      });

      const response = await axiosInstance.post('/auth/register', payload, {
        timeout: 30000, // 30 second timeout
      });
      
      const { message } = response.data;

      console.log('Registration successful:', response.data);

      // Dismiss processing toast
      processingToast.dismiss?.();

      toast({
        title: "Account created!",
        description: message || "Please check your email for verification code.",
      });

      navigate('/otp-verification', { state: { email: values.email } });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // More detailed error handling
      let errorMessage = "Failed to create account";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsAccept = (accepted: boolean) => {
    setTermsAccepted(accepted);
    if (accepted) {
      toast({
        title: "Terms Accepted",
        description: "You can now proceed with registration.",
      });
    }
  };

  // Update the role change handler to properly reset and validate fields
  const handleRoleChange = (newRole: 'user' | 'organization') => {
    setUserType(newRole);
    form.setValue('role', newRole);
    
    // Clear organization fields when switching to user
    if (newRole === 'user') {
      form.setValue('organizationName', '');
      form.setValue('organizationDescription', '');
      form.setValue('registrationNumber', '');
    }
    
    // Clear any existing validation errors
    form.clearErrors();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center flex-1">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join our crowdfunding platform to support local causes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Auth for Individual Users Only */}
            {userType === 'user' && (
              <div className="space-y-4 mb-6">
                <GoogleAuthButton mode="signup" disabled={isLoading} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* User Type Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant={field.value === 'user' ? 'default' : 'outline'}
                            onClick={() => handleRoleChange('user')}
                            disabled={isLoading}
                          >
                            Individual
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'organization' ? 'default' : 'outline'}
                            onClick={() => handleRoleChange('organization')}
                            disabled={isLoading}
                          >
                            Organization
                          </Button>
                        </div>
                      </FormControl>
                      {userType === 'organization' && (
                        <p className="text-sm text-muted-foreground">
                          ℹ️ Organization accounts must use email/password registration for verification purposes.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Basic Fields */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {userType === 'organization' ? 'Contact Person Name' : 'Full Name'}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization Fields */}
                {userType === 'organization' && (
                  <>
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isLoading}
                              placeholder="Enter your organization name"
                              required={userType === 'organization'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizationDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Description *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isLoading}
                              placeholder="Describe what your organization does"
                              required={userType === 'organization'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isLoading}
                              placeholder="Official registration number if available"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Password Fields */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Submit */}
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-primary hover:underline"
                    onClick={() => setTermsModalOpen(true)}
                  >
                    View Terms & Conditions
                  </Button>
                  {termsAccepted && (
                    <span className="text-green-600 text-sm">✓ Accepted</span>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : 
                   userType === 'organization' ? "Create Organization Account" : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </Form>

            <TermsModal
              open={termsModalOpen}
              onOpenChange={setTermsModalOpen}
              onAccept={handleTermsAccept}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;