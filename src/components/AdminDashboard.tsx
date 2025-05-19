
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminUsersList from './admin/AdminUsersList';
import AdminVehiclesList from './admin/AdminVehiclesList';

// User form schema
const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'driver', 'employee']),
  phone: z.string().optional(),
});

// Vehicle form schema
const vehicleFormSchema = z.object({
  type: z.string().min(2, 'Type must be at least 2 characters'),
  licensePlate: z.string().min(2, 'License plate must be at least 2 characters'),
  driverId: z.string().min(1, 'Driver must be selected'),
});

type UserFormData = z.infer<typeof userFormSchema>;
type VehicleFormData = z.infer<typeof vehicleFormSchema>;

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
      phone: '',
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      type: '',
      licensePlate: '',
      driverId: '',
    },
  });

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
      const response = await axios.get('http://localhost:4000/api/users', {
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
      const response = await axios.get('http://localhost:4000/api/vehicles', {
        headers,
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      // Filter drivers and employees
      setDrivers(usersData.filter((user: any) => user.role === 'driver'));
      setEmployees(usersData.filter((user: any) => user.role === 'employee'));
    }
  }, [usersData]);

  useEffect(() => {
    if (vehiclesData) {
      setVehicles(vehiclesData);
    }
  }, [vehiclesData]);

  const onUserSubmit = async (data: UserFormData) => {
    try {
      await axios.post('http://localhost:4000/api/users', data, { headers });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      userForm.reset();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const onVehicleSubmit = async (data: VehicleFormData) => {
    try {
      await axios.post('http://localhost:4000/api/vehicles', data, { headers });
      toast({
        title: 'Success',
        description: 'Vehicle created successfully',
      });
      vehicleForm.reset();
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
              {isLoadingUsers ? (
                <p className="text-center py-4">Loading drivers...</p>
              ) : usersError ? (
                <p className="text-center py-4 text-destructive">Error loading drivers</p>
              ) : (
                <AdminUsersList 
                  users={users}
                  refetchUsers={refetchUsers}
                  title="Drivers"
                  role="driver"
                />
              )}
            </TabsContent>
            
            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-4">
              {isLoadingUsers ? (
                <p className="text-center py-4">Loading employees...</p>
              ) : usersError ? (
                <p className="text-center py-4 text-destructive">Error loading employees</p>
              ) : (
                <AdminUsersList 
                  users={users}
                  refetchUsers={refetchUsers}
                  title="Employees"
                  role="employee"
                />
              )}
            </TabsContent>
            
            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4">
              {isLoadingVehicles || isLoadingUsers ? (
                <p className="text-center py-4">Loading vehicles...</p>
              ) : vehiclesError ? (
                <p className="text-center py-4 text-destructive">Error loading vehicles</p>
              ) : (
                <AdminVehiclesList 
                  vehicles={vehicles}
                  drivers={users}
                  refetchVehicles={refetchVehicles}
                />
              )}
            </TabsContent>
            
            {/* Add User Tab */}
            <TabsContent value="add-user" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                                <SelectItem value="employee">Employee</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Add User</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Add Vehicle Tab */}
            <TabsContent value="add-vehicle" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...vehicleForm}>
                    <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4">
                      <FormField
                        control={vehicleForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Bus, Van, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vehicleForm.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={vehicleForm.control}
                        name="driverId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Driver</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a driver" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Add Vehicle</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
