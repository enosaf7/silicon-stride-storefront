
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Settings, HelpCircle, LayoutDashboard } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';

const ProfileMenu: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile.",
          })
        }

        if (data) {
          setFirstName(data.first_name);
          setLastName(data.last_name);
        }
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      // The redirect is now handled in the AuthContext signOut function
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const avatarUrl = user?.email ? `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.email}` : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt="Profile Avatar" 
              ref={avatarRef}
              onError={() => {
                if (avatarRef.current) {
                  avatarRef.current.src = '/path/to/default/avatar.png';
                }
              }}
            />
          ) : (
            <AvatarFallback>
              {firstName ? firstName[0] : 'U'}{lastName ? lastName[0] : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          {firstName && lastName ? `${firstName} ${lastName}` : 'My Account'}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center space-x-2">
            <User className="h-4 w-4 mr-2" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center space-x-2">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/help" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
