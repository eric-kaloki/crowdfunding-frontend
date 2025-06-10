import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProjects from "./pages/ClientProjects";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitProject from "./pages/SubmitProject";
import PaymentInterface from "./pages/PaymentInterface";
import ProjectDetails from "./pages/ProjectDetails";
import PaymentPage from "./pages/PaymentPage";
import OTPVerificationPage from './pages/OTPVerificationPage';
import NotFound from './pages/NotFound.tsx';
// import { Analytics } from "@vercel/analytics/react"
// Admin pages
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import PendingProjects from "./pages/admin/PendingProjects";
import PendingCampaigns from "./pages/admin/PendingCampaigns";
import AdminContributions from "./pages/admin/AdminContributions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import ResetPassword from './pages/ResetPassword'; 
import PortfolioModal from "./pages/PortfolioModal.tsx";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Profile from "./pages/Profile";
// import AdminPayments from "./pages/admin/AdminPayments";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/portfolio" element={<PortfolioModal />} />
            <Route path="/otp-verification" element={<OTPVerificationPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected profile routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['user', 'organization', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute allowedRoles={['user', 'organization', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected client routes */}
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-campaign"
              element={
                <ProtectedRoute allowedRoles={['user', 'organization']}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-project"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <SubmitProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute allowedRoles={['client', 'admin']}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:id"
              element={
                <ProtectedRoute allowedRoles={['client', 'admin']}>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:id"
              element={
                <ProtectedRoute allowedRoles={['user', 'organization', 'admin']}>
                  <CampaignDetails />
                </ProtectedRoute>
              }
            />

            {/* Protected admin routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrganizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-projects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PendingProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-campaigns"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PendingCampaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contributions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminContributions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProjectDetails />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPayments />
                </ProtectedRoute>
              }
            /> */}

            {/* Protected organization routes */}
            <Route
              path="/organization-dashboard"
              element={
                <ProtectedRoute allowedRoles={['organization']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;