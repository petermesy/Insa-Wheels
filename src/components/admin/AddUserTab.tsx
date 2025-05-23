
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import UserForm, { UserFormData } from './UserForm';
const API_URL = import.meta.env.VITE_API_URL;

interface AddUserTabProps {
  refetchUsers: () => void;
}

const AddUserTab: React.FC<AddUserTabProps> = ({ refetchUsers }) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  const handleSubmit = async (data: UserFormData) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/users`, data, { headers });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
      </CardHeader>
      <CardContent>
        <UserForm onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
};

export default AddUserTab;
