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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import axiosInstance from '../utils/axiosConfig';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import GoogleAuthButton from '@/components/GoogleAuthButton';

// Login Form Schema
const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Password Reset Schema
const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login Form
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Password Reset Form
  const passwordResetForm = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      setIsLoading(true);

      // Remove any existing token before login
      localStorage.removeItem('token');

      const response = await axiosInstance.post('/auth/login', values, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      // Check if account needs verification
      if (data.needsVerification) {
        toast({
          title: "Verification Required",
          description: data.message || "Please check your email for verification code.",
        });
        
        // Redirect to OTP verification with email
        navigate('/otp-verification', { 
          state: { 
            email: data.email || values.email,
            fromLogin: true // Flag to indicate this came from login
          } 
        });
        return;
      }

      // Normal login flow for verified accounts
      const { token, user } = data;

      if (token && user) {
        // Store token first
        localStorage.setItem('token', token);

        // Then update auth context
        login(token, user);

        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });

        // Navigate based on user role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'organization') {
          navigate('/organization-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Invalid credentials";
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset submission
  const onPasswordResetSubmit = async (values: z.infer<typeof passwordResetSchema>) => {
    try {
      setIsLoading(true);
      await axiosInstance.post('/auth/forgot-password', values);
      toast({
        title: "Password reset link sent!",
        description: "Check your email for instructions.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.response?.data?.error || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center flex-1">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Login to your Transcends account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Auth Button */}
            <div className="space-y-4">
              <GoogleAuthButton mode="signin" disabled={isLoading} />
              
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

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 flex flex-col gap-2 text-center text-sm">
              <button
                onClick={() => setIsPasswordResetDialogOpen(true)}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
              <div>
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordResetForm}>
            <form onSubmit={passwordResetForm.handleSubmit(onPasswordResetSubmit)} className="space-y-4">
              <FormField
                control={passwordResetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
