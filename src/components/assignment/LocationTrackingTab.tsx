import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { Car, Navigation, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MapComponent from "./../MapComponent";
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
  const [vehicleLocations, setVehicleLocations] = useState<{
    [key: string]: Location;
  }>({});
  const [vehicleAddresses, setVehicleAddresses] = useState<{
    [key: string]: string;
  }>({});
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );

  // Reverse geocode lat/lon to address
  const fetchAddress = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch {
      return "Unknown location";
    }
  };

  // Initialize Socket.io connection and join admin room
  useEffect(() => {
    const socketUrl = API_URL.replace("/api", "");
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      upgrade: false,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // Join admin room
      newSocket.emit("joinRoom", "admin");
    });

    newSocket.on("adminCarLocationUpdate", (data) => {
      if (data && data.vehicleId) {
        setVehicleLocations((prev) => ({
          ...prev,
          [String(data.vehicleId)]: {
            coords: data.location,
            altitude: data.altitude,
            speed: data.speed,
            timestamp: data.timestamp,
          },
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

  // Fetch address when location changes
  useEffect(() => {
    if (!selectedVehicleId) return;
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const locationData = vehicle ? getLocationDataForVehicle(vehicle) : null;
    if (
      locationData &&
      locationData.coords &&
      locationData.coords[0] &&
      locationData.coords[1]
    ) {
      const lat = locationData.coords[0];
      const lon = locationData.coords[1];
      // Only fetch if not already cached
      if (
        !vehicleAddresses[selectedVehicleId] ||
        vehicleAddresses[selectedVehicleId] === "Fetching address..."
      ) {
        setVehicleAddresses((prev) => ({
          ...prev,
          [selectedVehicleId]: "Fetching address...",
        }));
        fetchAddress(lat, lon).then((address) => {
          setVehicleAddresses((prev) => ({
            ...prev,
            [selectedVehicleId]: address,
          }));
        });
      }
    }
    // eslint-disable-next-line
  }, [selectedVehicleId, vehicleLocations]);

  if (isLoading)
    return <p className="text-center py-4">Loading location data...</p>;

  // Get driver for a vehicle
  const getDriverForVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle || !vehicle.driver_id) return null;
    return users.find((u) => String(u.id) === String(vehicle.driver_id));
  };

  // Get employees assigned to a vehicle
  const getEmployeesForVehicle = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (
      !vehicle ||
      !vehicle.assigned_employees ||
      vehicle.assigned_employees.length === 0
    ) {
      return [];
    }
    return users.filter((u) =>
      vehicle.assigned_employees.map(String).includes(String(u.id))
    );
  };

  // Format speed for display
  const formatSpeed = (speed: number | null) => {
    if (speed === null || speed === undefined) return "N/A";
    return `${Math.round(speed * 3.6)} km/h`; // Convert from m/s to km/h
  };

  // Format time for display
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
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

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const driver = selectedVehicle
    ? getDriverForVehicle(selectedVehicle.id)
    : null;
  const locationData = selectedVehicle
    ? getLocationDataForVehicle(selectedVehicle)
    : null;

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
                vehicles.map((vehicle) => {
                  const driver = getDriverForVehicle(vehicle.id);
                  const hasLocation = !!getLocationDataForVehicle(vehicle);

                  return (
                    <div
                      key={vehicle.id}
                      className={`p-3 rounded-md cursor-pointer border transition-colors ${
                        selectedVehicleId === vehicle.id
                          ? "bg-purple-50 border-purple-200"
                          : "hover:bg-gray-50 border-transparent"
                      }`}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {vehicle.type} ({vehicle.license_plate})
                          </p>
                          <p className="text-sm text-gray-500">
                            Driver: {driver ? driver.name : "Not assigned"}
                          </p>
                        </div>
                        {hasLocation && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-800 border-green-200"
                          >
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
              <p className="text-gray-500">
                Select a vehicle to view location data
              </p>
            ) : !driver ? (
              <p className="text-gray-500">
                No driver assigned to this vehicle
              </p>
            ) : !locationData ? (
              <p className="text-gray-500">
                No location data available for this vehicle
              </p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">
                      {vehicleAddresses[selectedVehicleId ?? ""] ||
                        (locationData.coords
                          ? `${locationData.coords[0].toFixed(
                              6
                            )}, ${locationData.coords[1].toFixed(6)}`
                          : "Fetching address...")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <Car className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Speed</p>
                    <p className="font-medium">
                      {formatSpeed(locationData.speed)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <div className="flex justify-center mb-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500">Last Update</p>
                    <p className="font-medium">
                      {formatTime(locationData.timestamp)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Assigned Employees</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {getEmployeesForVehicle(selectedVehicle.id).length > 0 ? (
                      <ul className="space-y-1">
                        {getEmployeesForVehicle(selectedVehicle.id).map(
                          (employee) => (
                            <li
                              key={employee.id}
                              className="flex items-center gap-2"
                            >
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {employee.name} ({employee.email})
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500">
                        No employees assigned to this vehicle
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  {locationData && locationData.coords ? (
                    <MapComponent
                      vehicles={[
                        {
                          id: selectedVehicle?.id,
                          type: selectedVehicle?.type,
                          license_plate: selectedVehicle?.license_plate,
                          location: {
                            latitude: locationData.coords[0],
                            longitude: locationData.coords[1],
                          },
                        },
                      ]}
                      // Optionally, you can pass more props if your MapComponent supports them
                    />
                  ) : (
                    <p className="text-center text-gray-500">
                      No location to display on map
                    </p>
                  )}
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
