
import React from 'react';
import AdminVehiclesList from './AdminVehiclesList';

interface VehiclesTabProps {
  vehicles: any[];
  users: any[];
  isLoadingVehicles: boolean;
  isLoadingUsers: boolean;
  vehiclesError: unknown;
  refetchVehicles: () => void;
}

const VehiclesTab: React.FC<VehiclesTabProps> = ({ 
  vehicles, 
  users, 
  isLoadingVehicles, 
  isLoadingUsers, 
  vehiclesError, 
  refetchVehicles 
}) => {
  return isLoadingVehicles || isLoadingUsers ? (
    <p className="text-center py-4">Loading vehicles...</p>
  ) : vehiclesError ? (
    <p className="text-center py-4 text-destructive">Error loading vehicles</p>
  ) : (
    <AdminVehiclesList 
      vehicles={vehicles}
      drivers={users}
      refetchVehicles={refetchVehicles}
    />
  );
};

export default VehiclesTab;
