
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
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

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
      const response = await axios.get(
        // `http://localhost:4000/api/vehicles`,
        `${API_URL}/vehicles`,
        { headers }
      );
      return response.data.find((v: any) => v.driver_id === parseInt(userInfo.id));
    },
  });

  // Get current location
  const requestLocation = () => {
    if (navigator.geolocation) {
      setIsUpdatingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          if (vehicleData) {
            updateVehicleLocation(vehicleData.id, latitude, longitude);
          } else {
            updateDriverLocation(latitude, longitude);
            toast({
              title: 'Location Updated',
              description: 'Your location has been updated but no vehicle is assigned to you.',
            });
            setIsUpdatingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Could not get your current location.',
            variant: 'destructive',
          });
          setIsUpdatingLocation(false);
          
          // Fallback to simulated position
          simulateLocation();
        }
      );
    } else {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      // Fallback to simulated position
      simulateLocation();
    }
  };

  const simulateLocation = () => {
    // Simulate a location around INSA area
    setCurrentLocation({
      latitude: 9.0105 + (Math.random() * 0.01 - 0.005),
      longitude: 38.7652 + (Math.random() * 0.01 - 0.005),
    });
    
    if (vehicleData) {
      updateVehicleLocation(
        vehicleData.id,
        9.0105 + (Math.random() * 0.01 - 0.005),
        38.7652 + (Math.random() * 0.01 - 0.005)
      );
    }
  };

  const updateVehicleLocation = async (vehicleId: number, latitude: number, longitude: number) => {
    try {
      // Calculate a random speed between 0 and 60 km/h for simulation
      const speed = Math.floor(Math.random() * 60);
      
      await axios.put(
        // `http://localhost:4000/api/vehicles/${vehicleId}/location`,
        `${API_URL}/api/vehicles/${vehicleId}/location`,
        { latitude, longitude, speed },
        { headers }
      );
      
      toast({
        title: 'Location Updated',
        description: 'Vehicle location has been updated successfully.',
      });
      
      refetchVehicle();
    } catch (error) {
      console.error('Error updating vehicle location:', error);
      toast({
        title: 'Update Error',
        description: 'Failed to update vehicle location.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const updateDriverLocation = async (latitude: number, longitude: number) => {
    try {
      await axios.put(
        // `http://localhost:4000/api/users/${userInfo.id}/location`,
        `${API_URL}/api/users/${userInfo.id}/location`,
        { latitude, longitude },
        { headers }
      );
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  };

  // Request initial location when component mounts
  useEffect(() => {
    requestLocation();
    
    // Set up interval to update location periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      requestLocation();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
                onClick={requestLocation}
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
            />
          </div>
          
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
                    <p className="font-medium">
                      {vehicleData.location_speed || 0} km/h
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned Employees</h3>
                    <p className="font-medium">
                      {vehicleData.assigned_employees?.length || 0} employees
                    </p>
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
