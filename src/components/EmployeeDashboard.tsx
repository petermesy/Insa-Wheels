import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MapComponent from "./MapComponent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EmployeeDashboard: React.FC = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [driverAddress, setDriverAddress] = useState<string>("Loading...");
  const [socket, setSocket] = useState<Socket | null>(null);

  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
  const token = localStorage.getItem("auth_token");

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
    queryKey: ["employeeVehicles"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/vehicles`, { headers });
      return response.data.filter(
        (vehicle: any) =>
          vehicle.assigned_employees &&
          vehicle.assigned_employees.includes(parseInt(userInfo.id))
      );
    },
  });

  // Fetch all drivers to get their names
  const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/role/driver`, {
        headers,
      });
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
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location.",
            variant: "destructive",
          });
          setIsLocating(false);

          // Fallback to simulated location
          simulateLocation();
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
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

  const updateEmployeeLocation = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      await axios.put(
        `${API_URL}/users/${userInfo.id}/location`,
        { latitude, longitude },
        { headers }
      );

      toast({
        title: "Location Updated",
        description: "Your current location has been updated.",
      });
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Update Error",
        description: "Failed to update your location.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  // Enhanced vehicles data with driver names
  const enhancedVehicles = useMemo(() => {
    if (!vehiclesData || !driversData) return [];

    return vehiclesData.map((vehicle: any) => {
      const driver = driversData.find((d: any) => d.id === vehicle.driver_id);
      return {
        ...vehicle,
        driverId: vehicle.driver_id,
        driverName: driver ? driver.name : "Unknown Driver",
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

  // Reverse geocode function
  const getAddressFromLatLng = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat,
            lon,
            format: "json",
          },
        }
      );
      return response.data.display_name;
    } catch (error) {
      return "Unknown location";
    }
  };

  // Real-time driver location via Socket.IO
  useEffect(() => {
    const newSocket = io(API_URL.replace("/api", ""), {
      transports: ["websocket"],
      upgrade: false,
    });
    setSocket(newSocket);

    newSocket.emit("joinRoom", `employee_${userInfo.id}`);

    newSocket.on("carLocationUpdate", async (locationData) => {
      setDriverLocation(locationData);
      if (
        locationData &&
        Array.isArray(locationData.location) &&
        locationData.location.length === 2
      ) {
        const [lat, lon] = locationData.location;
        const address = await getAddressFromLatLng(lat, lon);
        setDriverAddress(address);
      } else {
        setDriverAddress("Unknown location");
      }
    });

    return () => {
      newSocket.off("carLocationUpdate");
      newSocket.emit("leaveRoom", `employee_${userInfo.id}`);
      newSocket.disconnect();
    };
    // eslint-disable-next-line
  }, [userInfo.id]);

  // Request initial location when component mounts
  useEffect(() => {
    requestLocation();

    // Set up interval to update location periodically (every minute)
    const intervalId = setInterval(() => {
      requestLocation();
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, []);

  // function to calculate distance (in kilometers):
  function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  //  Calculate the distance when both locations are available:
  const distanceToDriver =
    currentLocation && driverLocation && Array.isArray(driverLocation.location)
      ? haversineDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          driverLocation.location[0],
          driverLocation.location[1]
        )
      : null;
  //  Calculate Estimated Time (in minutes)

  const estimatedTimeToReach =
    distanceToDriver !== null &&
    driverLocation &&
    driverLocation.speed !== null &&
    driverLocation.speed !== undefined &&
    driverLocation.speed > 0
      ? (distanceToDriver / (driverLocation.speed * 3.6)) * 60 // speed is in m/s, convert to km/h
      : null;

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
              <Button onClick={requestLocation} disabled={isLocating}>
                {isLocating ? "Updating Location..." : "Update My Location"}
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
              // Pass driver's real-time location to the map
              driverLocation={
                driverLocation && Array.isArray(driverLocation.location)
                  ? {
                      latitude: driverLocation.location[0],
                      longitude: driverLocation.location[1],
                    }
                  : undefined
              }
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
                <p className="text-destructive">
                  Error loading vehicle information
                </p>
              </CardContent>
            </Card>
          ) : enhancedVehicles.length > 0 ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Your Location
                    </h3>
                    <p className="font-medium">
                      {currentLocation
                        ? `${currentLocation.latitude.toFixed(
                            5
                          )}, ${currentLocation.longitude.toFixed(5)}`
                        : "Updating..."}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Assigned Driver
                    </h3>
                    <p className="font-medium">
                      {enhancedVehicles[0].driverName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-4">
              <CardContent className="p-4">
                <p className="text-amber-500">
                  You are not assigned to any vehicle yet.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Assigned Driver Location (Real-Time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverLocation ? (
            <div className="bg-gray-100 p-4 rounded shadow">
              <div>
                <strong>Coordinates:</strong>{" "}
                {driverLocation.location[0].toFixed(6)},{" "}
                {driverLocation.location[1].toFixed(6)}
              </div>
              <div>
                <strong>Location Name:</strong> {driverAddress}
              </div>
              <div>
                <strong>Speed:</strong>{" "}
                {driverLocation.speed !== null &&
                driverLocation.speed !== undefined
                  ? `${Math.round(driverLocation.speed * 3.6)} km/h`
                  : "N/A"}
              </div>
              <div>
                <strong>Timestamp:</strong>{" "}
                {driverLocation.timestamp
                  ? new Date(driverLocation.timestamp).toLocaleString()
                  : "N/A"}
              </div>
              {distanceToDriver !== null && (
                <div>
                  <strong>Distance to Driver:</strong>{" "}
                  {distanceToDriver.toFixed(2)} km
                </div>
              )}
              {estimatedTimeToReach !== null && (
                <div>
                  <strong>Estimated Time to Reach:</strong>{" "}
                  {estimatedTimeToReach < 1
                    ? "< 1 min"
                    : `${estimatedTimeToReach.toFixed(1)} min`}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Waiting for driver location...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
