
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Import components for the assignment tabs
import DriverAssignmentTab from './assignment/DriverAssignmentTab';
import EmployeeAssignmentTab from './assignment/EmployeeAssignmentTab';
import VehicleAssignmentTab from './assignment/VehicleAssignmentTab';
import LocationTrackingTab from './assignment/LocationTrackingTab';

const AssignmentDashboard: React.FC = () => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // const response = await axios.get('http://localhost:4000/api/users', {
      const response = await axios.get(`${API_URL}/users`, {
        headers,
      });
      return response.data;
    },
  });

  // Fetch vehicles
  const {
    data: vehiclesData,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      // const response = await axios.get('http://localhost:4000/api/vehicles', {
      const response = await axios.get(`${API_URL}/vehicles`, {
        headers,
      });
      return response.data;
    },
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-50">
          <CardTitle className="text-2xl">Assignment Dashboard</CardTitle>
          <CardDescription>
            Manage vehicle assignments and track locations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="vehicles">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="vehicles">Vehicle Assignments</TabsTrigger>
              <TabsTrigger value="drivers">Driver Assignments</TabsTrigger>
              <TabsTrigger value="employees">Employee Assignments</TabsTrigger>
              <TabsTrigger value="tracking">Location Tracking</TabsTrigger>
            </TabsList>
            
            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4">
              <VehicleAssignmentTab
                vehicles={vehiclesData || []}
                drivers={usersData?.filter(u => u.role === 'driver') || []}
                isLoading={isLoadingVehicles || isLoadingUsers}
                error={vehiclesError}
                refetchVehicles={refetchVehicles}
              />
            </TabsContent>
            
            {/* Drivers Tab */}
            <TabsContent value="drivers" className="space-y-4">
              <DriverAssignmentTab
                drivers={usersData?.filter(u => u.role === 'driver') || []}
                vehicles={vehiclesData || []} 
                isLoading={isLoadingUsers || isLoadingVehicles}
                error={usersError}
                refetchUsers={refetchUsers}
                refetchVehicles={refetchVehicles}
              />
            </TabsContent>
            
            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
              <EmployeeAssignmentTab
                employees={usersData?.filter(u => u.role === 'employee') || []}
                vehicles={vehiclesData || []}
                isLoading={isLoadingUsers || isLoadingVehicles}
                error={usersError}
                refetchUsers={refetchUsers}
                refetchVehicles={refetchVehicles}
              />
            </TabsContent>
            
            {/* Location Tracking Tab */}
            <TabsContent value="tracking" className="space-y-4">
              <LocationTrackingTab 
                vehicles={vehiclesData || []}
                users={usersData || []}
                isLoading={isLoadingVehicles || isLoadingUsers}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDashboard;
