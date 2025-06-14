
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
  currentUserId: string;
  onRefresh: () => void;
}

const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  userId,
  currentRole,
  currentUserId,
  onRefresh
}) => {
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      if (userId === currentUserId && newRole !== 'admin') {
        toast.error("You cannot remove your own admin role");
        return;
      }
      
      // Delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Insert new role - ensure role is of the correct type
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: newRole as "user" | "admin" 
        });
        
      if (insertError) throw insertError;
      
      toast.success(`User role updated to ${newRole}`);
      onRefresh();
    } catch (error: any) {
      toast.error(`Failed to update user role: ${error.message}`);
    }
  };

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => handleRoleChange(userId, value)}
      disabled={userId === currentUserId}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserRoleSelect;
