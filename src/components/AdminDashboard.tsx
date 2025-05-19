
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockDrivers = [
  { id: 'd1', name: 'John Driver', email: 'john@insa.com', phone: '123-456-7890', vehicles: ['Toyota Hiace'] },
  { id: 'd2', name: 'Sarah Driver', email: 'sarah@insa.com', phone: '123-456-7891', vehicles: ['Ford Transit'] },
];

const mockEmployees = [
  { id: 'e1', name: 'Alice Employee', email: 'alice@insa.com', phone: '123-456-7892', department: 'IT', assignedDriver: 'd1' },
  { id: 'e2', name: 'Bob Employee', email: 'bob@insa.com', phone: '123-456-7893', department: 'HR', assignedDriver: 'd1' },
  { id: 'e3', name: 'Charlie Employee', email: 'charlie@insa.com', phone: '123-456-7894', department: 'Finance', assignedDriver: 'd2' },
];

const mockVehicles = [
  { id: 'v1', type: 'Toyota Hiace', licensePlate: 'ABC-123', assignedDriver: 'd1' },
  { id: 'v2', type: 'Ford Transit', licensePlate: 'XYZ-789', assignedDriver: 'd2' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  [key: string]: string;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('drivers');
  const [driverForm, setDriverForm] = useState<FormData>({ name: '', email: '', phone: '' });
  const [employeeForm, setEmployeeForm] = useState<FormData>({ name: '', email: '', phone: '', department: '', assignedDriver: '' });
  const [vehicleForm, setVehicleForm] = useState<FormData>({ type: '', licensePlate: '', assignedDriver: '' });

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Driver Added',
      description: `${driverForm.name} has been added as a driver.`,
    });
    setDriverForm({ name: '', email: '', phone: '' });
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Employee Added',
      description: `${employeeForm.name} has been added as an employee.`,
    });
    setEmployeeForm({ name: '', email: '', phone: '', department: '', assignedDriver: '' });
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Vehicle Added',
      description: `${vehicleForm.type} with license plate ${vehicleForm.licensePlate} has been added.`,
    });
    setVehicleForm({ type: '', licensePlate: '', assignedDriver: '' });
  };

  const handleInputChange = (form: string, field: string, value: string) => {
    if (form === 'driver') {
      setDriverForm(prev => ({ ...prev, [field]: value }));
    } else if (form === 'employee') {
      setEmployeeForm(prev => ({ ...prev, [field]: value }));
    } else if (form === 'vehicle') {
      setVehicleForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage drivers, employees, and vehicles for INSA-Wheels Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="drivers" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="drivers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Driver</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDriverSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driver-name">Name</Label>
                        <Input 
                          id="driver-name" 
                          value={driverForm.name} 
                          onChange={(e) => handleInputChange('driver', 'name', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver-email">Email</Label>
                        <Input 
                          id="driver-email" 
                          type="email" 
                          value={driverForm.email} 
                          onChange={(e) => handleInputChange('driver', 'email', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver-phone">Phone</Label>
                        <Input 
                          id="driver-phone" 
                          value={driverForm.phone} 
                          onChange={(e) => handleInputChange('driver', 'phone', e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <Button type="submit">Add Driver</Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Manage Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Assigned Vehicles</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDrivers.map(driver => (
                        <TableRow key={driver.id}>
                          <TableCell>{driver.name}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>{driver.vehicles.join(', ')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="employees" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee-name">Name</Label>
                        <Input 
                          id="employee-name" 
                          value={employeeForm.name} 
                          onChange={(e) => handleInputChange('employee', 'name', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-email">Email</Label>
                        <Input 
                          id="employee-email" 
                          type="email" 
                          value={employeeForm.email} 
                          onChange={(e) => handleInputChange('employee', 'email', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-phone">Phone</Label>
                        <Input 
                          id="employee-phone" 
                          value={employeeForm.phone} 
                          onChange={(e) => handleInputChange('employee', 'phone', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-department">Department</Label>
                        <Input 
                          id="employee-department" 
                          value={employeeForm.department} 
                          onChange={(e) => handleInputChange('employee', 'department', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee-driver">Assigned Driver</Label>
                        <Select 
                          onValueChange={(value) => handleInputChange('employee', 'assignedDriver', value)}
                          value={employeeForm.assignedDriver}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockDrivers.map(driver => (
                              <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit">Add Employee</Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Manage Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned Driver</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmployees.map(employee => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.phone}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{mockDrivers.find(d => d.id === employee.assignedDriver)?.name || 'None'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVehicleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-type">Vehicle Type</Label>
                        <Input 
                          id="vehicle-type" 
                          value={vehicleForm.type} 
                          onChange={(e) => handleInputChange('vehicle', 'type', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-plate">License Plate</Label>
                        <Input 
                          id="vehicle-plate" 
                          value={vehicleForm.licensePlate} 
                          onChange={(e) => handleInputChange('vehicle', 'licensePlate', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-driver">Assigned Driver</Label>
                        <Select 
                          onValueChange={(value) => handleInputChange('vehicle', 'assignedDriver', value)}
                          value={vehicleForm.assignedDriver}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockDrivers.map(driver => (
                              <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit">Add Vehicle</Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Manage Vehicles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Assigned Driver</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockVehicles.map(vehicle => (
                        <TableRow key={vehicle.id}>
                          <TableCell>{vehicle.type}</TableCell>
                          <TableCell>{vehicle.licensePlate}</TableCell>
                          <TableCell>{mockDrivers.find(d => d.id === vehicle.assignedDriver)?.name || 'None'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
