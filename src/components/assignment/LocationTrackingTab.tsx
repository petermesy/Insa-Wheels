import React, { useEffect, useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { io, Socket } from 'socket.io-client';
import { Car, Navigation, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const API_URL = import.meta.env.VITE_API_URL;

interface Location {
  coords: [number, number];
  altitude: number | null;
  speed: number | null;
  timestamp?: string;
}

interface LocationTrackingTabProps {
  vehicles: any[];
  users: any[];
  isLoading: boolean;
}

const LocationTrackingTab: React.FC<LocationTrackingTabProps> = ({
  vehicles,
  users,
  isLoading,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [vehicleLocations, setVehicleLocations] = useState<{[key: string]: Location}>({});
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Initialize Socket.io connection and join admin room
  useEffect(() => {
    const newSocket = io(`${API_URL}`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Join admin room
      newSocket.emit('join', { role: 'admin' });
    });

    newSocket.on('adminCarLocationUpdate', (data) => {
      if (data && data.vehicleId) {
        setVehicleLocations(prev => ({
          ...prev,
          [String(data.vehicleId)]: {
            coords: data.location,
            altitude: data.altitude,
            speed: data.speed,
            timestamp: data.timestamp,
          }
        }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Select first vehicle by default
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  if (isLoading) return <p className="text-center py-4">Loading location data...</p>;

  // Get driver for a vehicle
  const getDriverForVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.driver_id) return null;
    return users.find(u => String(u.id) === String(vehicle.driver_id));
  };

  // Get employees assigned to a vehicle
  const getEmployeesForVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.assigned_employees || vehicle.assigned_employees.length === 0) {
      return [];
    }
    return users.filter(u => vehicle.assigned_employees.map(String).includes(String(u.id)));
  };

  // Format speed for display
  const formatSpeed = (speed: number | null) => {
    if (speed === null || speed === undefined) return 'N/A';
    return `${Math.round(speed * 3.6)} km/h`; // Convert from m/s to km/h
  };

  // Format time for display
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get latest location data for a vehicle (live or static)
  const getLocationDataForVehicle = (vehicle: any) => {
    // Prefer live location from socket, fallback to DB fields
    const live = vehicleLocations[String(vehicle.id)];
    if (live) return live;

    // Fallback to DB fields if available
    if (
      vehicle.location_latitude !== undefined &&
      vehicle.location_longitude !== undefined
    ) {
      return {
        coords: [
          Number(vehicle.location_latitude) || 0,
          Number(vehicle.location_longitude) || 0,
        ] as [number, number],
        altitude: vehicle.location_altitude ?? null,
        speed: vehicle.location_speed ?? null,
        timestamp: vehicle.location_timestamp ?? undefined,
      };
    }
    return null;
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const driver = selectedVehicle ? getDriverForVehicle(selectedVehicle.id) : null;
  const locationData = selectedVehicle ? getLocationDataForVehicle(selectedVehicle) : null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Vehicle Selection */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicles.length === 0 ? (
                <p className="text-gray-500">No vehicles available</p>
              ) : (
                vehicles.map(vehicle => {
                  const driver = getDriverForVehicle(vehicle.id);
                  const hasLocation = !!getLocationDataForVehicle(vehicle);

                  return (
                    <div 
                      key={vehicle.id}
                      className={`p-3 rounded-md cursor-pointer border transition-colors ${
                        selectedVehicleId === vehicle.id 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{vehicle.type} ({vehicle.license_plate})</p>
                          <p className="text-sm text-gray-500">
                            Driver: {driver ? driver.name : 'Not assigned'}
                          </p>
                        </div>
                        {hasLocation && (
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Location Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedVehicle ? (
              <p className="text-gray-500">Select a vehicle to view location data</p>
            ) : !driver ? (
              <p className="text-gray-500">No driver assigned to this vehicle</p>
            ) : !locationData ? (
              <p className="text-gray-500">No location data available for this vehicle</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Coordinates</p>
                    <p className="font-medium">
                      {locationData.coords[0].toFixed(6)}, {locationData.coords[1].toFixed(6)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <Car className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Speed</p>
                    <p className="font-medium">{formatSpeed(locationData.speed)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Last Update</p>
                    <p className="font-medium">{formatTime(locationData.timestamp)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Assigned Employees</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {getEmployeesForVehicle(selectedVehicle.id).length > 0 ? (
                      <ul className="space-y-1">
                        {getEmployeesForVehicle(selectedVehicle.id).map(employee => (
                          <li key={employee.id} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {employee.name} ({employee.email})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No employees assigned to this vehicle</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-center text-gray-500">Map view would be displayed here</p>
                  <p className="text-center text-sm text-gray-400">
                    (A real map integration would show the vehicle location)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationTrackingTab;