import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MapComponent from './MapComponent';

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = `${API_URL}/locations`;

const DriverDashboard: React.FC = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy?: number; speed?: number; altitude?: number } | null>(null);
  const [status, setStatus] = useState("Waiting...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem('auth_token') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [userRole, setUserRole] = useState("");
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [address, setAddress] = useState("Loading...");
  const [altitude, setAltitude] = useState<number | null>(null);

  // Fetch user info from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    console.log('User Info:', userInfo); // Debug: Log user info
    setUsername(userInfo.email || "");
    setUserRole(userInfo.role || "");
  }, []);

  // Login handler
  const handleLogin = async () => {
    setStatus("Logging in...");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: username,
        password,
      });
      setToken(res.data.token);
      setUserRole(res.data.user?.role || "");
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
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

  // Fetch assigned employees
  const fetchAssignedEmployees = async (employeeIds: number[]) => {
    console.log('Fetching employees with IDs:', employeeIds); // Debug: Log employee IDs
    if (!employeeIds || employeeIds.length === 0) {
      console.log('No employee IDs provided');
      setAssignedEmployees([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Users fetched:', res.data); // Debug: Log all users
      const employees = res.data.filter((u: any) =>
        employeeIds.map(Number).includes(Number(u.id))
      );
      console.log('Filtered employees:', employees); // Debug: Log filtered employees
      setAssignedEmployees(employees);
      if (employees.length === 0) {
        toast({
          title: "No Employees Found",
          description: "No employees match the assigned IDs.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAssignedEmployees([]);
      toast({
        title: "Error",
        description: "Failed to fetch assigned employees.",
        variant: "destructive",
      });
    }
  };

  // Fetch assigned vehicle info and employees
  const fetchVehicleData = async () => {
    setIsLoadingVehicle(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      console.log('Fetching vehicle for user ID:', userInfo.id); // Debug: Log user ID
      const vehiclesRes = await axios.get(`${API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Vehicles fetched:', vehiclesRes.data); // Debug: Log all vehicles
      const vehicle = vehiclesRes.data.find((v: any) => v.driver_id === Number(userInfo.id));
      console.log('Assigned vehicle:', vehicle); // Debug: Log found vehicle
      setVehicleData(vehicle || null);

      if (vehicle && vehicle.assigned_employees) {
        console.log('Assigned employee IDs:', vehicle.assigned_employees); // Debug: Log employee IDs
        await fetchAssignedEmployees(vehicle.assigned_employees);
      } else {
        console.log('No vehicle or no assigned employees');
        setAssignedEmployees([]);
        if (!vehicle) {
          toast({
            title: "No Vehicle Assigned",
            description: "You are not assigned to any vehicle.",
            variant: "warning",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setVehicleData(null);
      setAssignedEmployees([]);
      toast({
        title: "Error",
        description: "Failed to fetch vehicle information.",
        variant: "destructive",
      });
    }
    setIsLoadingVehicle(false);
  };

  // Send location to backend
  const sendLocationToBackend = async (
    latitude: number,
    longitude: number,
    accuracy: number | null,
    speed: number | null,
    altitude: number | null
  ) => {
    setStatus("Sending location...");
    try {
      await axios.post(
        `${BACKEND_URL}/car-location`,
        {
          location: [latitude, longitude],
          accuracy,
          speed,
          altitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatus("Location sent to employees!");
      toast({
        title: "Location Sent",
        description: `Location sent: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
      });
      fetchVehicleData(); // Refresh vehicle data after location update
    } catch (e: any) {
      setStatus(
        e.response?.data?.error
          ? `Failed to send location: ${e.response.data.error}`
          : `Failed to send location: ${e.message}`
      );
      toast({
        title: "Send Failed",
        description: e.response?.data?.error || e.message,
        variant: "destructive",
      });
    }
    setIsUpdatingLocation(false);
  };

  // Get and send location
  const getAndSendLocation = async () => {
    if (userRole !== "driver") {
      setStatus("Access denied: Only drivers can send location.");
      return;
    }
    setIsUpdatingLocation(true);
    setStatus("Requesting location...");

    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by your browser.");
      setIsUpdatingLocation(false);
      toast({
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, altitude, accuracy, speed } = pos.coords;
        setLocation({ latitude, longitude, altitude, accuracy, speed });
        setAltitude(altitude ?? null);

        try {
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
            }
          );
          setAddress(geoRes.data.display_name || "Unknown location");
        } catch {
          setAddress("Unknown location");
        }

        await sendLocationToBackend(latitude, longitude, accuracy ?? null, speed ?? null, altitude ?? null);
      },
      (err) => {
        setStatus("Permission denied or error getting location.");
        setIsUpdatingLocation(false);
        toast({
          title: "Location Error",
          description: "Could not get your current location: " + err.message,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fetch vehicle and employees on login
  useEffect(() => {
    if (isLoggedIn && userRole === "driver") {
      fetchVehicleData();
      getAndSendLocation();
      const interval = setInterval(getAndSendLocation, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [isLoggedIn, token, userRole]);

  // Enhanced vehicle data with memoization
  const enhancedVehicle = useMemo(() => {
    if (!vehicleData) return null;
    return {
      ...vehicleData,
      driverId: vehicleData.driver_id,
      assignedEmployees: vehicleData.assigned_employees || [],
    };
  }, [vehicleData]);

  // UI
  if (!isLoggedIn) {
    return (
      <Card className="max-w-md mx-auto mt-16">
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
            className="mb-2 p-2 w-full rounded border border-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2 p-2 w-full rounded border border-gray-300"
          />
          <Button onClick={handleLogin} className="w-full">Login</Button>
          <p className="mt-2 text-sm text-gray-500">{status}</p>
        </CardContent>
      </Card>
    );
  }

  if (userRole !== "driver") {
    return (
      <Card className="max-w-md mx-auto mt-16">
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
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Driver Dashboard</CardTitle>
            <CardDescription>Share your location with assigned employees</CardDescription>
          </div>
          <Button onClick={getAndSendLocation} disabled={isUpdatingLocation}>
            {isUpdatingLocation ? "Updating..." : "Update Location"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border mb-6" style={{ height: 400 }}>
            {location && (
              <MapComponent
                vehicles={enhancedVehicle ? [enhancedVehicle] : []}
                driverLocation={location}
              />
            )}
          </div>
          {isLoadingVehicle ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p>Loading vehicle information...</p>
              </CardContent>
            </Card>
          ) : !enhancedVehicle ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-amber-500">You are not assigned to any vehicle yet.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-none border">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Sharing Location</div>
                        <div className="text-sm text-muted-foreground">
                          Your location is being shared with assigned employees
                        </div>
                      </div>
                      <span className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-green-700 font-medium">Live</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none border">
                  <CardContent className="py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Vehicle Type</div>
                        <div className="font-semibold">{enhancedVehicle?.type || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">License Plate</div>
                        <div className="font-semibold">{enhancedVehicle?.license_plate || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Current Speed</div>
                        <div className="font-semibold">
                          {location?.speed ? `${Math.round(location.speed * 3.6)} km/h` : "0 km/h"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Assigned Employees</div>
                        <div className="font-semibold">
                          {assignedEmployees.length} {assignedEmployees.length === 1 ? "employee" : "employees"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-none border">
                  <CardContent className="py-4">
                    <div className="font-semibold mb-2">Assigned Employees</div>
                    <ul className="list-disc ml-5">
                      {assignedEmployees.length > 0 ? (
                        assignedEmployees.map((emp) => (
                          <li key={emp.id}>
                            {emp.name} ({emp.email})
                          </li>
                        ))
                      ) : (
                        <li>No employees assigned</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="shadow-none border">
                  <CardContent className="py-4">
                    <div className="font-semibold mb-2">Current Location</div>
                    <div className="text-sm">Address: {address || "Fetching address..."}</div>
                    <div className="text-sm">Altitude: {altitude !== null ? `${altitude.toFixed(2)} meters` : "N/A"}</div>
                    <div className="text-sm">Speed: {location?.speed ? `${Math.round(location.speed * 3.6)} km/h` : "N/A"}</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          <div className="mt-4 text-sm text-muted-foreground">{status}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;