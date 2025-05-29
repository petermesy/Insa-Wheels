import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import VehicleCard from './VehicleCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const API_URL = import.meta.env.VITE_API_URL;

interface AdminVehiclesListProps {
  vehicles: any[];
  drivers: any[];
  refetchVehicles: () => void;
}

const AdminVehiclesList: React.FC<AdminVehiclesListProps> = ({
  vehicles = [],
  drivers,
  refetchVehicles,
}) => {
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [editRowId, setEditRowId] = useState<string | number | null>(null);
  const [deleteRowId, setDeleteRowId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const itemsPerPage = 6;

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const currentVehicles = vehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteVehicle = async (vehicleId: string | number) => {
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'No authentication token found. Please log in.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/vehicles/${vehicleId}`, { headers });
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });
      refetchVehicles();
    } catch (error: any) {
      let errorMessage = 'Failed to delete vehicle';
      if (error.response?.status === 404) {
        errorMessage = 'Vehicle not found';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid request';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized: Invalid or expired token';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to delete this vehicle';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'Server error: Unable to delete vehicle';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    setDeleteRowId(null);
  };

  const handleEditClick = (vehicle: any) => {
    setEditRowId(vehicle.id);
    setEditForm({
      type: vehicle.type,
      licensePlate: vehicle.license_plate,
      destination: vehicle.destination,
      driverId: vehicle.driver_id?.toString() || '',
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (vehicleId: string | number) => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_URL}/vehicles/${vehicleId}`,
        {
          type: editForm.type,
          licensePlate: editForm.licensePlate,
          destination: editForm.destination,
          driverId: editForm.driverId,
        },
        { headers }
      );
      toast({
        title: 'Success',
        description: 'Vehicle updated successfully',
      });
      setEditRowId(null);
      refetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update vehicle',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle>
          Vehicles ({vehicles.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            onClick={() => setViewMode('card')}
          >
            Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500">No vehicles found.</p>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    drivers={drivers}
                    onDelete={handleDeleteVehicle}
                    onUpdate={refetchVehicles}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border">Type</th>
                      <th className="px-3 py-2 border">License Plate</th>
                      <th className="px-3 py-2 border">Destination</th>
                      <th className="px-3 py-2 border">Driver</th>
                      <th className="px-3 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        {editRowId === vehicle.id ? (
                          <>
                            <td className="px-3 py-2 border">
                              <Input
                                name="type"
                                value={editForm.type}
                                onChange={handleEditChange}
                                required
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <Input
                                name="licensePlate"
                                value={editForm.licensePlate}
                                onChange={handleEditChange}
                                required
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <Input
                                name="destination"
                                value={editForm.destination}
                                onChange={handleEditChange}
                                required
                              />
                            </td>
                            <td className="px-3 py-2 border">
                              <select
                                name="driverId"
                                value={editForm.driverId}
                                onChange={handleEditChange}
                                className="w-full border rounded p-1"
                                required
                              >
                                <option value="">Select a driver</option>
                                {drivers
                                  .filter((driver) => driver.role === "driver")
                                  .map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 border flex gap-2">
                              <Button size="sm" onClick={() => handleEditSave(vehicle.id)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditRowId(null)}
                              >
                                Cancel
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 border">{vehicle.type}</td>
                            <td className="px-3 py-2 border">{vehicle.license_plate}</td>
                            <td className="px-3 py-2 border">{vehicle.destination}</td>
                            <td className="px-3 py-2 border">
                              {drivers.find(d => d.id === vehicle.driver_id)?.name || 'Not assigned'}
                            </td>
                            <td className="px-3 py-2 border flex gap-2">
                              <Button
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEditClick(vehicle)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteRowId(vehicle.id)}
                              >
                                Delete
                              </Button>
                              {/* Delete confirmation dialog */}
                              <Dialog open={deleteRowId === vehicle.id} onOpenChange={(open) => !open && setDeleteRowId(null)}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                  </DialogHeader>
                                  <p>
                                    Are you sure you want to delete the vehicle <strong>{vehicle.type}</strong> - {vehicle.license_plate}?
                                  </p>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteRowId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteVehicle(vehicle.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminVehiclesList;