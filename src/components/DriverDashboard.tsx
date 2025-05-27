import React, { useState } from 'react';
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
  const [location, setLocation] = useState<any>(null);
  const [status, setStatus] = useState("Waiting...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth_token'));
  const [userRole, setUserRole] = useState("");
  const [address, setAddress] = useState("");
  const [altitude, setAltitude] = useState<number | null>(null);

  // Get user info and token from localStorage
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
        `${API_URL}/vehicles`,
        { headers }
      );
      return response.data.find((v: any) => v.driver_id === parseInt(userInfo.id));
    },
    enabled: !!userInfo.id && !!token,
  });

  // Get and send driver's location
  const getAndSendLocation = async () => {
    if (userRole !== "driver") {
      setStatus("Access denied: Only drivers can send location.");
      return;
    }
    setIsUpdatingLocation(true);
    setStatus("Getting location...");

    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by your browser.");
      setIsUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = pos.coords;
        setCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocation(coords);
        setAltitude(coords.altitude || null);

        // Reverse geocode (optional, using OpenStreetMap)
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          setAddress(res.data.display_name || "Unknown location");
        } catch {
          setAddress("Unknown location");
        }

        setStatus("Sending location...");
        try {
          await axios.post(
            `${API_URL}/locations/car-location`,
            {
              location: [coords.latitude, coords.longitude],
              accuracy: coords.accuracy,
              speed: coords.speed,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setStatus("Location sent!");
          refetchVehicle();
        } catch (e: any) {
          setStatus(
            e.response?.data?.error
              ? `Failed to send location: ${e.response.data.error}`
              : `Failed to send location: ${e.message}`
          );
        }
        setIsUpdatingLocation(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setStatus("Permission denied or error getting location.");
        setIsUpdatingLocation(false);
      }
    );
  };

  // Handle login
  const handleLogin = async () => {
    setStatus("Logging in...");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: username,
        password,
      });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
      setUserRole(res.data.user?.role || "");
      setStatus("Login successful!");
      toast({ title: "Login Successful", description: "Welcome, driver!" });
    } catch (e: any) {
      setStatus(
        e.response?.data?.error
          ? `Login failed: ${e.response.data.error}`
          : `Login failed: ${e.message}`
      );
      toast({
        title: "Login Failed",
        description: e.response?.data?.error || e.message,
        variant: "destructive",
      });
    }
  };

  // On mount, set userRole from localStorage
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    setUserRole(userInfo.role || "");
  }, [isLoggedIn]);

  // UI
  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
          <p>{status}</p>
        </CardContent>
      </Card>
    );
  }

  if (userRole !== "driver") {
    return (
      <Card>
        <CardContent>
          <p style={{ color: "red", fontWeight: "bold", fontSize: 18 }}>
            Access denied: Only drivers can use this app.
          </p>
          <p>Status: {status}</p>
        </CardContent>
      </Card>
    );
  }

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
