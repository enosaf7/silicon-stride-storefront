
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import UserRoleSelect from './UserRoleSelect';
import UserTableActions from './UserTableActions';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  order_count: number;
  role: string;
}

interface UserTableRowProps {
  user: User;
  currentUserId: string;
  onRefresh: () => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
  currentUserId, 
  onRefresh 
}) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">
        {user.first_name || ''} {user.last_name || ''}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{user.order_count}</Badge>
      </TableCell>
      <TableCell>
        <UserRoleSelect
          userId={user.id}
          currentRole={user.role}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
        />
      </TableCell>
      <TableCell className="text-right">
        <UserTableActions
          userId={user.id}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
