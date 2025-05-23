
import React, { useEffect, useState } from 'react';
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

// Import our new components
import DriversTab from './admin/DriversTab';
import EmployeesTab from './admin/EmployeesTab';
import VehiclesTab from './admin/VehiclesTab';
import AddUserTab from './admin/AddUserTab';
import AddVehicleTab from './admin/AddVehicleTab';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

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

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      // Filter drivers
      setDrivers(usersData.filter((user: any) => user.role === 'driver'));
    }
  }, [usersData]);

  useEffect(() => {
    if (vehiclesData) {
      setVehicles(vehiclesData);
    }
  }, [vehiclesData]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-white shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-50">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage vehicles, drivers, and employees
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="drivers">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="add-user">Add User</TabsTrigger>
              <TabsTrigger value="add-vehicle">Add Vehicle</TabsTrigger>
            </TabsList>
            
            {/* Drivers Tab */}
            <TabsContent value="drivers" className="space-y-4">
              <DriversTab
                users={users}
                isLoading={isLoadingUsers}
                error={usersError}
                refetchUsers={refetchUsers}
              />
            </TabsContent>
            
            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
              <EmployeesTab
                users={users}
                isLoading={isLoadingUsers}
                error={usersError}
                refetchUsers={refetchUsers}
              />
            </TabsContent>
            
            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4">
              <VehiclesTab
                vehicles={vehicles}
                users={users}
                isLoadingVehicles={isLoadingVehicles}
                isLoadingUsers={isLoadingUsers}
                vehiclesError={vehiclesError}
                refetchVehicles={refetchVehicles}
              />
            </TabsContent>
            
            {/* Add User Tab */}
            <TabsContent value="add-user" className="space-y-4">
              <AddUserTab refetchUsers={refetchUsers} />
            </TabsContent>
            
            {/* Add Vehicle Tab */}
            <TabsContent value="add-vehicle" className="space-y-4">
              <AddVehicleTab drivers={drivers} refetchVehicles={refetchVehicles} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
