import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Bus, Car, Truck, Trash2, Edit } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

interface VehicleCardProps {
  vehicle: any;
  drivers: any[];
  onDelete: (id: string | number) => void;
  onUpdate: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  drivers,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("auth_token");

  // Form state
  const [formData, setFormData] = useState({
    type: vehicle.type || "",
    licensePlate: vehicle.license_plate || vehicle.licensePlate || "",
    destination: vehicle.destination || "",
    driverId:
      vehicle.driver_id?.toString() || vehicle.driverId?.toString() || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, driverId: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      type: vehicle.type || "",
      licensePlate: vehicle.license_plate || vehicle.licensePlate || "",
      destination: vehicle.destination || "",
      driverId:
        vehicle.driver_id?.toString() || vehicle.driverId?.toString() || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please log in.",
        variant: "destructive",
      });
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_URL}/vehicles/${vehicle.id}`,
        {
          type: formData.type,
          licensePlate: formData.licensePlate,
          destination: formData.destination,
          driverId: formData.driverId,
        },
        { headers }
      );
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      let errorMessage = "Failed to update vehicle";
      if (error.response?.status === 404) {
        errorMessage = "Vehicle not found";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || "Invalid request";
      } else if (error.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid or expired token";
      } else if (error.response?.status === 500) {
        errorMessage =
          error.response?.data?.error ||
          "Server error: Unable to update vehicle";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(vehicle.id);
    setIsDeleteDialogOpen(false);
  };

  const getVehicleIcon = (type: string) => {
    type = type.toLowerCase();
    if (type.includes("bus"))
      return <Bus className="text-purple-600" size={20} />;
    if (type.includes("truck"))
      return <Truck className="text-purple-600" size={20} />;
    return <Car className="text-purple-600" size={20} />;
  };

  const driver = drivers.find((d) => d.id.toString() === formData.driverId);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center gap-2">
          {getVehicleIcon(vehicle.type)}
          {vehicle.type} - {vehicle.license_plate || vehicle.licensePlate}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select type</option>
                <option value="bus">Bus</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                License Plate
              </label>
              <Input
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="ABC-123"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Destination
              </label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Destination"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Assign Driver
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
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
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">License:</span>
              <span className="text-sm">
                {vehicle.license_plate || vehicle.licensePlate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Driver:</span>
              <span className="text-sm">{driver?.name || "Not assigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Employees:</span>
              <Badge variant="secondary">
                {vehicle.assignedEmployees?.length || 0} assigned
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Destination:</span>
              <span className="text-sm">
                {vehicle.destination || "Not assigned"}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gray-50 p-2 flex justify-end gap-2">
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the vehicle {vehicle.type} -{" "}
              {vehicle.license_plate || vehicle.licensePlate}?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
