
import React from 'react';
import AdminUsersList from './AdminUsersList';

interface EmployeesTabProps {
  users: any[];
  isLoading: boolean;
  error: unknown;
  refetchUsers: () => void;
}

const EmployeesTab: React.FC<EmployeesTabProps> = ({ users, isLoading, error, refetchUsers }) => {
  return isLoading ? (
    <p className="text-center py-4">Loading employees...</p>
  ) : error ? (
    <p className="text-center py-4 text-destructive">Error loading employees</p>
  ) : (
    <AdminUsersList 
      users={users}
      refetchUsers={refetchUsers}
      title="Employees"
      role="employee"
    />
  );
};

export default EmployeesTab;
