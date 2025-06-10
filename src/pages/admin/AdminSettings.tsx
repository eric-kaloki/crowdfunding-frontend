import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/utils/axiosConfig";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Loader2, 
  Bell, 
  Lock, 
  Users, 
  Shield, 
  AlertTriangle, 
  Mail,
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Settings schema
const settingsSchema = {
  users: {
    accountDeletionEnabled: true,
    maxCampaignsPerUser: 5,
  },
  notifications: {
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    campaignUpdatesEnabled: true,
    systemAlertsEnabled: true,
  },
  security: {
    passwordMinLength: 8,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    twoFactorRequired: true,
  },
};

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(settingsSchema);
  const [loading, setLoading] = useState(true);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/settings");
      setSettings(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category, key, value) => {
    try {
      // Update settings using PUT request with full category object
      const currentCategorySettings = settings[category] || {};
      const updatedCategorySettings = {
        ...currentCategorySettings,
        [key]: value
      };

      const response = await axiosInstance.put('/admin/settings', {
        [category]: updatedCategorySettings
      });

      setSettings((prev) => ({
        ...prev,
        [category]: updatedCategorySettings
      }));

      toast({
        title: "Settings updated",
        description: `${key} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: "Update failed",
        description: error.response?.data?.error || "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/admin/settings/reset");
      setSettings(response.data.settings);
      toast({
        title: "Settings reset",
        description: "All settings have been reset to default values.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.response?.data?.error || "Failed to reset settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-4">
      <Header />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
            <TabsTrigger value="security">Security Settings</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Account Deletion Enabled</h4>
                        <p className="text-sm text-gray-600">Allow users to delete their own accounts</p>
                      </div>
                      <Switch
                        checked={settings?.users?.accountDeletionEnabled !== false}
                        onCheckedChange={(checked) => updateSetting('users', 'accountDeletionEnabled', checked)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Max Campaigns Per User</label>
                      <Input
                        type="number"
                        value={settings?.users?.maxCampaignsPerUser || 5}
                        onChange={(e) => updateSetting('users', 'maxCampaignsPerUser', parseInt(e.target.value))}
                        min="1"
                        max="50"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Enable email notifications for users</p>
                      </div>
                      <Switch
                        checked={settings?.notifications.emailNotificationsEnabled !== false}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailNotificationsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Enable SMS notifications for critical updates</p>
                      </div>
                      <Switch
                        checked={settings?.notifications.smsNotificationsEnabled !== false}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsNotificationsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Campaign Updates</h4>
                        <p className="text-sm text-gray-600">Notify users about campaign status changes</p>
                      </div>
                      <Switch
                        checked={settings?.notifications.campaignUpdatesEnabled !== false}
                        onCheckedChange={(checked) => updateSetting('notifications', 'campaignUpdatesEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">System Alerts</h4>
                        <p className="text-sm text-gray-600">Send notifications for system maintenance and updates</p>
                      </div>
                      <Switch
                        checked={settings?.notifications.systemAlertsEnabled !== false}
                        onCheckedChange={(checked) => updateSetting('notifications', 'systemAlertsEnabled', checked)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security & Authentication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Password Minimum Length</label>
                        <Input
                          type="number"
                          value={settings?.security.passwordMinLength || 8}
                          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                          min="6"
                          max="20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                        <Input
                          type="number"
                          value={settings?.security.sessionTimeoutMinutes || 60}
                          onChange={(e) => updateSetting('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                          min="15"
                          max="480"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Max Login Attempts</label>
                      <Input
                        type="number"
                        value={settings?.security.maxLoginAttempts || 5}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Number of failed login attempts before account lockout
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication Required</h4>
                        <p className="text-sm text-gray-600">Require 2FA for all admin and organization accounts</p>
                      </div>
                      <Switch
                        checked={settings?.security.twoFactorRequired !== false}
                        onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Security Notice</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Changes to security settings will affect all users. Test thoroughly in a staging environment before applying to production.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approval Modal for Reset Settings */}
        <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Settings Reset</DialogTitle>
              <DialogDescription>
                This action will reset all platform settings to their default values. 
                This cannot be undone. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsApprovalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  resetToDefaults();
                  setIsApprovalModalOpen(false);
                }}
              >
                Reset All Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSettings;