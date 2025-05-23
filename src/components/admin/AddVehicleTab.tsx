
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import VehicleForm, { VehicleFormData } from './VehicleForm';
const API_URL = import.meta.env.VITE_API_URL;

interface AddVehicleTabProps {
  drivers: any[];
  refetchVehicles: () => void;
}

const AddVehicleTab: React.FC<AddVehicleTabProps> = ({ drivers, refetchVehicles }) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/vehicles`, data, { headers });
      toast({
        title: 'Success',
        description: 'Vehicle created successfully',
      });
      refetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create vehicle',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <VehicleForm onSubmit={handleSubmit} drivers={drivers} />
      </CardContent>
    </Card>
  );
};

export default AddVehicleTab;
