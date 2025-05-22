
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Bus, Car, Truck, Trash2, Edit } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;

// Vehicle form schema
const vehicleFormSchema = z.object({
  type: z.string().min(2, 'Type must be at least 2 characters'),
  licensePlate: z.string().min(2, 'License plate must be at least 2 characters'),
  destination: z.string().min(2, 'License plate must be at least 2 characters'),
  driverId: z.string().min(1, 'Driver must be selected'),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleCardProps {
  vehicle: any;
  drivers: any[];
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, drivers, onDelete, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  
  const driver = drivers.find((d) => d.id === vehicle.driverId);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      destination: vehicle.destination,
      driverId: vehicle.driverId,
    },
  });

  const getVehicleIcon = (type: string) => {
    type = type.toLowerCase();
    if (type.includes('bus')) return <Bus className="text-purple-600" size={20} />;
    if (type.includes('truck')) return <Truck className="text-purple-600" size={20} />;
    return <Car className="text-purple-600" size={20} />;
  };

  const handleEdit = () => {
    setIsDialogOpen(true);
  };

  const handleUpdate = async (data: VehicleFormData) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/api/vehicles/${vehicle.id}`, data, { headers });
      toast({
        title: 'Success',
        description: 'Vehicle updated successfully',
      });
      setIsDialogOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update vehicle',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      onDelete(vehicle.id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            {getVehicleIcon(vehicle.type)}
            {vehicle.type} - {vehicle.licensePlate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">License:</span>
              <span className="text-sm">{vehicle.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Driver:</span>
              <span className="text-sm">{driver?.name || 'Not assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Employees:</span>
              <Badge variant="secondary">{vehicle.assignedEmployees?.length || 0} assigned</Badge>
            </div>
          </div>
          
          {vehicle.assignedEmployees?.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">ASSIGNED EMPLOYEES</h4>
              <div className="flex flex-wrap gap-1">
                {vehicle.assignedEmployees.map((empId: string) => {
                  const employee = drivers.find((d) => d.id === empId) || { name: 'Unknown' };
                  return (
                    <Badge key={empId} variant="outline">
                      {employee.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-gray-50 p-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="flex items-center gap-1">
            <Edit size={14} />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={14} />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Driver</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VehicleCard;
