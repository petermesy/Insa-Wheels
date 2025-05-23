
import React from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Car, UserCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import EmployeeAssignmentForm from './EmployeeAssignmentForm';
const API_URL = import.meta.env.VITE_API_URL;
interface EmployeeAssignmentTabProps {
  employees: any[];
  vehicles: any[];
  isLoading: boolean;
  error: unknown;
  refetchUsers: () => void;
  refetchVehicles: () => void;
}

const EmployeeAssignmentTab: React.FC<EmployeeAssignmentTabProps> = ({
  employees,
  vehicles,
  isLoading,
  error,
  refetchUsers,
  refetchVehicles,
}) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  const handleAssignEmployee = async (vehicleId: number, employeeId: number) => {
    try {
      await axios.post(`${API_URL}/vehicles/${vehicleId}/assign`, 
        { employeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: "Success",
        description: "Employee assigned to vehicle successfully",
      });
      
      refetchVehicles();
    } catch (err) {
      console.error("Error assigning employee:", err);
      toast({
        title: "Error",
        description: "Failed to assign employee to vehicle",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <p className="text-center py-4">Loading employee assignments...</p>;
  if (error) return <p className="text-center py-4 text-destructive">Error loading employee data</p>;

  // Find which vehicle an employee is assigned to
  const getEmployeeVehicle = (employeeId: number) => {
    return vehicles.find(v => v.assigned_employees && 
      v.assigned_employees.includes(employeeId));
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No employees found</TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => {
                      const assignedVehicle = getEmployeeVehicle(employee.id);
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4" />
                              {employee.name}
                            </div>
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>
                            {assignedVehicle ? (
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span>
                                  {assignedVehicle.type} ({assignedVehicle.license_plate})
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">Not assigned</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignment Form */}
        <EmployeeAssignmentForm 
          employees={employees} 
          vehicles={vehicles} 
          onAssign={handleAssignEmployee} 
        />
      </div>
    </div>
  );
};

export default EmployeeAssignmentTab;
