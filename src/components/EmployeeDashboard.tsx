
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import MapComponent from './MapComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EmployeeDashboard: React.FC = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const token = localStorage.getItem('auth_token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  // Fetch vehicles where this employee is assigned
  const {
    data: vehiclesData,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useQuery({
    queryKey: ['employeeVehicles'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/vehicles', { headers });
      return response.data.filter((vehicle: any) => 
        vehicle.assigned_employees && 
        vehicle.assigned_employees.includes(parseInt(userInfo.id))
      );
    },
  });
  
  // Fetch all drivers to get their names
  const {
    data: driversData,
    isLoading: isLoadingDrivers,
  } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/users/role/driver', { headers });
      return response.data;
    },
  });
  
  const requestLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          updateEmployeeLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Could not get your current location.',
            variant: 'destructive',
          });
          setIsLocating(false);
          
          // Fallback to simulated location
          simulateLocation();
        }
      );
    } else {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      // Fallback to simulated location
      simulateLocation();
    }
  };
  
  const simulateLocation = () => {
    // Simulate a location around INSA area
    const latitude = 9.0155 + (Math.random() * 0.01 - 0.005);
    const longitude = 38.7632 + (Math.random() * 0.01 - 0.005);
    
    setCurrentLocation({ latitude, longitude });
    updateEmployeeLocation(latitude, longitude);
  };
  
  const updateEmployeeLocation = async (latitude: number, longitude: number) => {
    try {
      await axios.put(
        `http://localhost:4000/api/users/${userInfo.id}/location`,
        { latitude, longitude },
        { headers }
      );
      
      toast({
        title: 'Location Updated',
        description: 'Your current location has been updated.',
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Update Error',
        description: 'Failed to update your location.',
        variant: 'destructive',
      });
    } finally {
      setIsLocating(false);
    }
  };
  
  // Enhanced vehicles data with driver names
  const enhancedVehicles = React.useMemo(() => {
    if (!vehiclesData || !driversData) return [];
    
    return vehiclesData.map((vehicle: any) => {
      const driver = driversData.find((d: any) => d.id === vehicle.driver_id);
      return {
        ...vehicle,
        driverId: vehicle.driver_id,
        driverName: driver ? driver.name : 'Unknown Driver',
        location: {
          latitude: parseFloat(vehicle.location_latitude) || 0,
          longitude: parseFloat(vehicle.location_longitude) || 0,
          speed: parseFloat(vehicle.location_speed) || 0,
          timestamp: vehicle.location_timestamp,
        },
        assignedEmployees: vehicle.assigned_employees || [],
      };
    });
  }, [vehiclesData, driversData]);
  
  // Request initial location when component mounts
  useEffect(() => {
    requestLocation();
    
    // Set up interval to update location periodically (every minute)
    const intervalId = setInterval(() => {
      requestLocation();
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Employee Dashboard</CardTitle>
              <CardDescription>
                Track your assigned transportation service
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={requestLocation} 
                disabled={isLocating}
              >
                {isLocating ? 'Updating Location...' : 'Update My Location'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <MapComponent 
              vehicles={enhancedVehicles}
              employeeLocation={currentLocation || undefined}
              employeeId={userInfo.id}
            />
          </div>
          
          {isLoadingVehicles || isLoadingDrivers ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p>Loading vehicle information...</p>
              </CardContent>
            </Card>
          ) : vehiclesError ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-destructive">Error loading vehicle information</p>
              </CardContent>
            </Card>
          ) : enhancedVehicles.length > 0 ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Your Location</h3>
                    <p className="font-medium">
                      {currentLocation ? (
                        `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
                      ) : (
                        'Updating...'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned Driver</h3>
                    <p className="font-medium">{enhancedVehicles[0].driverName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-amber-500">You are not assigned to any vehicle yet.</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
