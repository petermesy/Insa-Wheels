
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
import { Car, User, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import EmployeeAssignmentForm from './EmployeeAssignmentForm';

interface DriverAssignmentTabProps {
  drivers: any[];
  vehicles: any[];
  isLoading: boolean;
  error: unknown;
  refetchUsers: () => void;
  refetchVehicles: () => void;
}

const DriverAssignmentTab: React.FC<DriverAssignmentTabProps> = ({
  drivers,
  vehicles,
  isLoading,
  error,
  refetchUsers,
  refetchVehicles,
}) => {
  if (isLoading) return <p className="text-center py-4">Loading driver assignments...</p>;
  if (error) return <p className="text-center py-4 text-destructive">Error loading driver data</p>;

  // Get driver's assigned vehicle and employees
  const getDriverVehicle = (driverId: number) => {
    return vehicles.find(v => v.driver_id === driverId);
  };

  const getAssignedEmployees = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.assigned_employees) return [];
    return vehicle.assigned_employees;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Drivers and Their Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {drivers.length === 0 ? (
              <p className="text-center py-4">No drivers found</p>
            ) : (
              drivers.map((driver) => {
                const vehicle = getDriverVehicle(driver.id);
                
                return (
                  <AccordionItem key={driver.id} value={`driver-${driver.id}`}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="font-medium">{driver.name}</span>
                        {vehicle && (
                          <span className="ml-2 text-sm text-gray-500">
                            - Driving: {vehicle.type} ({vehicle.license_plate}) ({vehicle.destination})
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4" />
                            Assigned Vehicle
                          </h3>
                          {vehicle ? (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p><strong>Type:</strong> {vehicle.type}</p>
                              <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
                              <p><strong>Destination:</strong> {vehicle.destination}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500">No vehicle assigned</p>
                          )}
                        </div>
                        
                        {vehicle && (
                          <div>
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4" />
                              Assigned Employees
                            </h3>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Name</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getAssignedEmployees(vehicle.id).length > 0 ? (
                                    getAssignedEmployees(vehicle.id).map((employeeId: number) => {
                                      const employee = drivers.find(u => u.id === employeeId);
                                      return (
                                        <TableRow key={employeeId}>
                                          <TableCell>{employeeId}</TableCell>
                                          <TableCell>
                                            {employee ? employee.name : 'Unknown Employee'}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={2} className="text-center">
                                        No employees assigned
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverAssignmentTab;
