import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const TopAppBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 flex flex-row items-center justify-between p-4 bg-white backdrop-blur-md border-b w-full">
        <div className="flex items-center justify-between p-2 bg-background">
          <img
            src="/transcends.png"
            alt="Transcends Logo"
            className="hidden md:block h-10 w-auto"
          />
          <img
            src="/transcends-icon.png"
            alt="Transcends Logo"
            className="md:hidden h-10 w-auto"
          />
        </div>
        <div className="flex flex-row items-center space-x-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleProfileClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <User size={16} />
            <span className="font-medium">
              {user.name.split(' ')[0]}
            </span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground bg-gray-200"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </div>
  );
};