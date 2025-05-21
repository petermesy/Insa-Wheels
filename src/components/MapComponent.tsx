import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

interface Location {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string;
  altitude?: number;
  accuracy?: number;
}

interface VehicleData {
  id: string;
  driverId: string;
  driverName: string;
  location: Location;
  assignedEmployees: string[];
}

interface MapComponentProps {
  vehicles?: VehicleData[];
  employeeLocation?: Location;
  employeeId?: string;
  isDriver?: boolean;
  driverId?: string;
  driverLocation?: { latitude: number; longitude: number }; // Real-time driver location
}

const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61168.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapComponent: React.FC<MapComponentProps> = ({
  vehicles = [],
  employeeLocation,
  employeeId,
  isDriver = false,
  driverId,
  driverLocation,
}) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);
  const [carLocationName, setCarLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Convert to [lat, lng] array for Leaflet
  const employeeLatLng =
    employeeLocation && employeeLocation.latitude && employeeLocation.longitude
      ? [employeeLocation.latitude, employeeLocation.longitude]
      : undefined;
  const driverLatLng =
    driverLocation && driverLocation.latitude && driverLocation.longitude
      ? [driverLocation.latitude, driverLocation.longitude]
      : undefined;

  // Fetch route, distance, and ETA whenever locations change
  useEffect(() => {
    const fetchRoute = async () => {
      if (!employeeLatLng || !driverLatLng) return;
      const apiKey = "a2618160-4888-4804-be62-891f5cba83c9";
      const url = `https://graphhopper.com/api/1/route?point=${driverLatLng[0]},${driverLatLng[1]}&point=${employeeLatLng[0]},${employeeLatLng[1]}&vehicle=car&locale=en&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        if (
          response.data.paths &&
          response.data.paths.length > 0 &&
          response.data.paths[0].points &&
          response.data.paths[0].points.coordinates
        ) {
          const points = response.data.paths[0].points.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          setRoute(points);
          setDistance(response.data.paths[0].distance);
          setEta(response.data.paths[0].time / 1000);
        } else {
          setError("No route found");
          setRoute([]);
          setDistance(0);
          setEta(0);
        }
      } catch (error) {
        setError("Error fetching route");
        setRoute([]);
        setDistance(0);
        setEta(0);
      }
    };
    fetchRoute();
  }, [employeeLatLng, driverLatLng]);

  // Reverse geocode car location to get address
  useEffect(() => {
    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        return response.data.display_name;
      } catch (error) {
        return "Unknown location";
      }
    };
    if (driverLatLng) {
      reverseGeocode(driverLatLng[0], driverLatLng[1]).then(setCarLocationName);
    }
  }, [driverLatLng]);

  // Calculate ETA string
  const etaString = eta
    ? eta < 60
      ? "Less than a minute"
      : `${Math.round(eta / 60)} min`
    : "--";

  // Calculate distance string
  const distanceString = distance ? `${(distance / 1000).toFixed(2)} km` : "--";

  // Center map on employee or driver or default
  const center =
    employeeLatLng || driverLatLng || [9.0155, 38.7632];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow" style={{ minHeight: "400px" }}>
        <MapContainer
          center={center as [number, number]}
          zoom={14}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {employeeLatLng && (
            <Marker position={employeeLatLng} icon={userIcon}>
              <Popup>You (Employee)</Popup>
            </Marker>
          )}
          {driverLatLng && (
            <Marker position={driverLatLng} icon={carIcon}>
              <Popup>
                Driver<br />
                {carLocationName && (
                  <>
                    <span className="font-semibold">Location:</span> {carLocationName}
                    <br />
                  </>
                )}
                Lat: {driverLatLng[0].toFixed(6)}, Lng: {driverLatLng[1].toFixed(6)}
              </Popup>
            </Marker>
          )}
          {route.length > 0 && <Polyline positions={route} color="blue" />}
        </MapContainer>

        {/* Info panel */}
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 md:w-2/3 lg:w-1/2">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">Distance</span>
                  <span className="font-medium">{distanceString}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">ETA</span>
                  <span className="font-medium">{etaString}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">Driver Location</span>
                  <span className="font-medium">{carLocationName || "--"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Driver-specific controls */}
      {isDriver && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-medium">Sharing Location</h3>
                <p className="text-sm text-muted-foreground">
                  Your location is being shared with assigned employees
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full pulse-dot"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {error && (
        <div className="text-red-500 text-center mt-2">{error}</div>
      )}
    </div>
  );
};

export default MapComponent;