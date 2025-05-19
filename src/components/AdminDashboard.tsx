
import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const assignEmployee = async (vehicleId: string, employeeId: string) => {
    try {
      await axios.post(
        `http://localhost:4000/api/vehicles/${vehicleId}/assign`,
        { employeeId },
        { headers }
      );
      toast({
        title: 'Success',
        description: 'Employee assigned successfully',
      });
      refetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign employee',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage vehicles, drivers, and employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="assign">Assign</TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
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
              
              <Card>
                <CardHeader>
                  <CardTitle>User List</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <p>Loading users...</p>
                  ) : usersError ? (
                    <p className="text-destructive">Error loading users</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Phone</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.phone || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-4">
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle List</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingVehicles ? (
                    <p>Loading vehicles...</p>
                  ) : vehiclesError ? (
                    <p className="text-destructive">Error loading vehicles</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>License Plate</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Assigned Employees</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.map((vehicle) => {
                          const driver = users.find((u) => u.id === vehicle.driverId);
                          return (
                            <TableRow key={vehicle.id}>
                              <TableCell>{vehicle.type}</TableCell>
                              <TableCell>{vehicle.licensePlate}</TableCell>
                              <TableCell>{driver?.name || 'Not assigned'}</TableCell>
                              <TableCell>
                                {vehicle.assignedEmployees?.length || 0} employees
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Assign Tab */}
            <TabsContent value="assign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Employees to Vehicles</CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicles.map((vehicle) => {
                    const driver = users.find((u) => u.id === vehicle.driverId);
                    
                    return (
                      <Card key={vehicle.id} className="mb-4">
                        <CardHeader>
                          <CardTitle>{vehicle.type} - {vehicle.licensePlate}</CardTitle>
                          <CardDescription>
                            Driver: {driver?.name || 'Not assigned'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Assigned Employees:</h4>
                              {vehicle.assignedEmployees?.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {vehicle.assignedEmployees.map((empId: string) => {
                                    const employee = users.find((u) => u.id === empId);
                                    return <li key={empId}>{employee?.name || 'Unknown'}</li>;
                                  })}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">No employees assigned yet</p>
                              )}
                            </div>
                            
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-2">Assign Employee:</h4>
                              <div className="flex items-center gap-2">
                                <Select
                                  onValueChange={(value) => assignEmployee(vehicle.id, value)}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select an employee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employees
                                      .filter(
                                        (emp) => !vehicle.assignedEmployees?.includes(emp.id)
                                      )
                                      .map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                          {employee.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
