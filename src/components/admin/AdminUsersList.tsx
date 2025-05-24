
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import UserCard from './UserCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
const API_URL = import.meta.env.VITE_API_URL;

interface AdminUsersListProps {
  users: any[];
  refetchUsers: () => void;
  title?: string;
  role?: string;
}

const AdminUsersList: React.FC<AdminUsersListProps> = ({ users, refetchUsers, title = "Users", role }) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const filteredUsers = role ? users.filter(user => user.role === role) : users;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteUser = async (userId: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/users/${userId}`, { headers });
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      refetchUsers();
    } catch (error: any) {
      console.log(error);
      
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({filteredUsers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onDelete={handleDeleteUser} 
              onUpdate={refetchUsers} 
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersList;
