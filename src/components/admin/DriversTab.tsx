
import React from 'react';
import { Link } from 'react-router-dom';
import AdminUsersList from './AdminUsersList';
import { Button } from '@/components/ui/button';

interface DriversTabProps {
  users: any[];
  isLoading: boolean;
  error: unknown;
  refetchUsers: () => void;
}

const DriversTab: React.FC<DriversTabProps> = ({ users, isLoading, error, refetchUsers }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Drivers Management</h2>
        <Link to="/assignments">
          <Button variant="outline">
            View & Manage Assignments
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4">Loading drivers...</p>
      ) : error ? (
        <p className="text-center py-4 text-destructive">Error loading drivers</p>
      ) : (
        <AdminUsersList 
          users={users}
          refetchUsers={refetchUsers}
          title="Drivers"
          role="driver"
        />
      )}
    </div>
  );
};

export default DriversTab;
