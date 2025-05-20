
import React from 'react';
import AdminUsersList from './AdminUsersList';

interface DriversTabProps {
  users: any[];
  isLoading: boolean;
  error: unknown;
  refetchUsers: () => void;
}

const DriversTab: React.FC<DriversTabProps> = ({ users, isLoading, error, refetchUsers }) => {
  return isLoading ? (
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
  );
};

export default DriversTab;
