import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MapComponent from './MapComponent';

const DriverDashboard: React.FC = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; speed?: number | null; altitude?: number | null } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('Waiting...');

  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const token = localStorage.getItem('auth_token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch driver's assigned vehicle
  const {
    data: vehicleData,
    isLoading: isLoadingVehicle,
    error: vehicleError,
    refetch: refetchVehicle,
  } = useQuery({
    queryKey: ['driverVehicle'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/vehicles`, { headers });
      return response.data.find((v: any) => v.driver_id === parseInt(userInfo.id)) || null;
    },
  });

  // Fetch assigned employees
  const fetchAssignedEmployees = async (employeeIds: number[]) => {
    if (!employeeIds || employeeIds.length === 0) {
      setAssignedEmployees([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/users`, { headers });
      const employees = res.data.filter((u: any) =>
        employeeIds.map(Number).includes(Number(u.id))
      );
      setAssignedEmployees(employees);
    } catch {
      setAssignedEmployees([]);
    }
  };

  // Update vehicle location
  const updateVehicleLocation = async (
    vehicleId: number,
    latitude: number,
    longitude: number,
    speed?: number | null,
    altitude?: number | null
  ) => {
    try {
      await axios.put(
        `${API_URL}/vehicles/${vehicleId}/location`,
        { latitude, longitude, speed, altitude },
        { headers }
      );
      setStatus('Location sent to employees!');
      toast({
        title: 'Location Sent',
        description: `Location sent to employees: (${latitude}, ${longitude})`,
      });
      // Console log the location
      console.log('Driver location sent:', { latitude, longitude, speed, altitude });
      refetchVehicle();
    } catch (error: any) {
      setStatus('Failed to send location');
      toast({
        title: 'Update Error',
        description: 'Failed to update vehicle location.',
        variant: 'destructive',
      });
    }
    setIsUpdatingLocation(false);
  };

  // Get and send location
  const getAndSendLocation = () => {
    if (!vehicleData?.id) {
      setStatus('No assigned vehicle found.');
      setIsUpdatingLocation(false);
      return;
    }
    setIsUpdatingLocation(true);
    setStatus('Getting location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, speed, altitude } = position.coords;
          setCurrentLocation({ latitude, longitude, speed: speed ?? null, altitude: altitude ?? null });
          // Reverse geocode for address
          try {
            const geoRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse`,
              {
                params: {
                  lat: latitude,
                  lon: longitude,
                  format: 'json',
                },
              }
            );
            setAddress(geoRes.data.display_name || 'Unknown location');
          } catch {
            setAddress('Unknown location');
          }
          await updateVehicleLocation(
            vehicleData.id,
            latitude,
            longitude,
            speed ?? null,
            altitude ?? null
          );
        },
        (error) => {
          setStatus('Could not get your current location.');
          toast({
            title: 'Location Error',
            description: 'Could not get your current location.',
            variant: 'destructive',
          });
          setIsUpdatingLocation(false);
        }
      );
    } else {
      setStatus('Geolocation not supported');
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      setIsUpdatingLocation(false);
    }
  };

  // On mount, fetch employees and start periodic location updates
  useEffect(() => {
    if (vehicleData?.assigned_employees) {
      fetchAssignedEmployees(vehicleData.assigned_employees);
    }
    getAndSendLocation();
    const interval = setInterval(getAndSendLocation, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [vehicleData?.id]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Driver Dashboard</CardTitle>
              <CardDescription>
                Share your location with assigned employees
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={getAndSendLocation}
                disabled={isUpdatingLocation}
              >
                {isUpdatingLocation ? 'Updating Location...' : 'Update Location'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <MapComponent
              isDriver={true}
              driverId={userInfo.id}
              vehicles={vehicleData ? [vehicleData] : []}
              employeeLocation={undefined}
              driverLocation={currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : undefined}
            />
          </div>
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Location</h3>
                  <p className="font-medium">{address || 'Fetching address...'}</p>
                  <h3 className="text-sm font-medium text-muted-foreground">Altitude</h3>
                  <p className="font-medium">
                    {currentLocation && currentLocation.altitude !== undefined && currentLocation.altitude !== null
                      ? `${currentLocation.altitude.toFixed(2)} meters`
                      : 'N/A'}
                  </p>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Speed</h3>
                  <p className="font-medium">
                    {currentLocation && currentLocation.speed !== undefined && currentLocation.speed !== null
                      ? Math.round(currentLocation.speed * 3.6)
                      : 0} km/h
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned Employees</h3>
                  <ul>
                    {assignedEmployees.length > 0 ? assignedEmployees.map((emp) => (
                      <li key={emp.id}>{emp.name} ({emp.email})</li>
                    )) : <li>No employees assigned</li>}
                  </ul>
                </div>
              </div>
              <div className="mt-2 text-muted-foreground">Status: {status}</div>
            </CardContent>
          </Card>
          {isLoadingVehicle ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p>Loading vehicle information...</p>
              </CardContent>
            </Card>
          ) : vehicleError ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-destructive">Error loading vehicle information</p>
              </CardContent>
            </Card>
          ) : vehicleData ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Vehicle Type</h3>
                    <p className="font-medium">{vehicleData.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">License Plate</h3>
                    <p className="font-medium">{vehicleData.license_plate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Speed</h3>
                    <p className="font-medium">{vehicleData.location_speed || 0} km/h</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned Employees</h3>
                    <p className="font-medium">{vehicleData.assigned_employees?.length || 0} employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-amber-500">No vehicle is assigned to you yet.</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;