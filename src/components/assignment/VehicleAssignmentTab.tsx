
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
import { Button } from '@/components/ui/button';
import { Car, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import VehicleAssignmentForm from './VehicleAssignmentForm';
const API_URL = import.meta.env.VITE_API_URL;

interface VehicleAssignmentTabProps {
  vehicles: any[];
  drivers: any[];
  isLoading: boolean;
  error: unknown;
  refetchVehicles: () => void;
}

const VehicleAssignmentTab: React.FC<VehicleAssignmentTabProps> = ({
  vehicles,
  drivers,
  isLoading,
  error,
  refetchVehicles,
}) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  const handleAssignDriver = async (vehicleId: number, driverId: number) => {
    try {
      
      await axios.put(`${API_URL}/vehicles/${vehicleId}`, 
        { 
          type: vehicles.find(v => v.id === vehicleId).type,
          licensePlate: vehicles.find(v => v.id === vehicleId).license_plate,
          destination: vehicles.find(v => v.id === vehicleId).destination,
          driverId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: "Success",
        description: "Driver assigned to vehicle successfully",
      });
      
      refetchVehicles();
    } catch (err) {
      console.error("Error assigning driver:", err);
      toast({
        title: "Error",
        description: "Failed to assign driver to vehicle",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <p className="text-center py-4">Loading vehicle assignments...</p>;
  if (error) return <p className="text-center py-4 text-destructive">Error loading vehicle data</p>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vehicle List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Assigned Driver</TableHead>
                   <TableHead>Destination</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No vehicles found</TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.type}</TableCell>
                        <TableCell>{vehicle.license_plate}</TableCell>
                        <TableCell>
                          {vehicle.driver_id ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {drivers.find(d => d.id === vehicle.driver_id)?.name || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>{vehicle.destination}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignment Form */}
        <VehicleAssignmentForm 
          vehicles={vehicles} 
          drivers={drivers} 
          onAssign={handleAssignDriver} 
        />
      </div>
    </div>
  );
};

export default VehicleAssignmentTab;
