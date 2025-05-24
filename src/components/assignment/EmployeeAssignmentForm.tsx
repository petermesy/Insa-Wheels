
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface EmployeeAssignmentFormProps {
  employees: any[];
  vehicles: any[];
  onAssign: (vehicleId: number, employeeId: number) => Promise<void>;
}

const EmployeeAssignmentForm: React.FC<EmployeeAssignmentFormProps> = ({
  employees,
  vehicles,
  onAssign,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedEmployeeId) return;

    setIsSubmitting(true);
    try {
      await onAssign(Number(selectedVehicleId), Number(selectedEmployeeId));
      setSelectedEmployeeId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out employees that are already assigned to the selected vehicle
  const getAvailableEmployees = () => {
    if (!selectedVehicleId) return employees;

    const vehicle = vehicles.find(v => v.id === Number(selectedVehicleId));
    if (!vehicle || !vehicle.assigned_employees) return employees;

    return employees.filter(e => !vehicle.assigned_employees.includes(e.id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Assign Employee to Vehicle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Select Vehicle</Label>
            <Select
              value={selectedVehicleId}
              onValueChange={(value) => {
                setSelectedVehicleId(value);
                setSelectedEmployeeId('');
              }}
            >
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.type} ({vehicle.license_plate})
                    {vehicle.type} ({vehicle.destination})

                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              disabled={!selectedVehicleId}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableEmployees().map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedVehicleId || !selectedEmployeeId || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Employee to Vehicle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeAssignmentForm;
