
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Mock types for demonstration - these would be replaced with actual API responses
interface Location {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string;
}

interface VehicleData {
  id: string;
  driverId: string;
  driverName: string;
  location: Location;
  assignedEmployees: string[];
}

interface EmployeeLocation {
  id: string;
  name: string;
  location: Location;
}

interface MapComponentProps {
  vehicles?: VehicleData[];
  employeeLocation?: Location;
  employeeId?: string;
  isDriver?: boolean;
  driverId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  vehicles = [],
  employeeLocation,
  employeeId,
  isDriver = false,
  driverId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  
  // Mock data for demonstration
  const mockVehicles: VehicleData[] = [
    {
      id: 'v1',
      driverId: 'd1',
      driverName: 'John Driver',
      location: {
        latitude: 9.0105,
        longitude: 38.7652,
        speed: 35,
        timestamp: new Date().toISOString(),
      },
      assignedEmployees: ['e1', 'e2'],
    },
    {
      id: 'v2',
      driverId: 'd2',
      driverName: 'Sarah Driver',
      location: {
        latitude: 9.0225,
        longitude: 38.7622,
        speed: 0,
        timestamp: new Date().toISOString(),
      },
      assignedEmployees: ['e3'],
    },
  ];
  
  const mockEmployeeLocation: Location = {
    latitude: 9.0155, 
    longitude: 38.7632,
  };

  // Calculate distance function
  const calculateDistance = (loc1: Location, loc2: Location) => {
    // Simple distance calculation (this is just for demonstration)
    const R = 6371e3; // Earth radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Distance in meters
  };

  // Calculate ETA function
  const calculateETA = (distance: number, speed: number) => {
    if (speed <= 0) return 'Vehicle stopped';
    // Convert speed to m/s
    const speedMps = speed * 1000 / 3600;
    // Calculate time in seconds
    const timeSeconds = distance / speedMps;
    
    if (timeSeconds < 60) {
      return 'Less than a minute';
    } else if (timeSeconds < 3600) {
      return `${Math.round(timeSeconds / 60)} minutes`;
    } else {
      const hours = Math.floor(timeSeconds / 3600);
      const minutes = Math.round((timeSeconds % 3600) / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    // This is a placeholder for the map implementation
    // In a real implementation, you would initialize a map library like Google Maps or Mapbox here
    console.log('Map would be initialized here with container:', mapContainerRef.current);
    
    // Mock setting the map
    setMap({
      initialized: true,
      addMarker: (location: Location, options: any) => {
        console.log('Added marker at', location, 'with options', options);
        return { 
          id: Math.random().toString(),
          setContent: (content: string) => console.log('Set marker content to', content),
          setPosition: (pos: any) => console.log('Updated marker position to', pos)
        };
      },
      setCenter: (location: Location) => {
        console.log('Set map center to', location);
      }
    });

    // Clean up function
    return () => {
      console.log('Map would be destroyed here');
      setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!map?.initialized) return;

    // This would add markers for vehicles
    const vehiclesToShow = vehicles.length > 0 ? vehicles : mockVehicles;
    
    vehiclesToShow.forEach(vehicle => {
      console.log(`Added vehicle marker for ${vehicle.driverName} at ${vehicle.location.latitude}, ${vehicle.location.longitude}`);
      // This would add a marker for each vehicle
    });

    // This would add a marker for the employee's location
    const empLocation = employeeLocation || mockEmployeeLocation;
    console.log(`Added employee marker at ${empLocation.latitude}, ${empLocation.longitude}`);

    // Set initial selected vehicle if employee is viewing
    if (!isDriver && vehiclesToShow.length > 0) {
      setSelectedVehicle(vehiclesToShow[0]);
    }

  }, [map, vehicles, employeeLocation, isDriver]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow" style={{ minHeight: '400px' }}>
        {/* This div would contain the actual map */}
        <div ref={mapContainerRef} className="w-full h-full bg-gray-200 rounded-md">
          {/* Placeholder content - this would be replaced by actual map */}
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-gray-500">Map Loading... This is a placeholder for the actual map interface.</p>
          </div>
        </div>
        
        {/* Bottom info panel for distance and ETA when employee is viewing */}
        {!isDriver && selectedVehicle && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 md:w-2/3 lg:w-1/2">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">Driver</span>
                    <span className="font-medium">{selectedVehicle.driverName}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">Distance</span>
                    <span className="font-medium">
                      {(calculateDistance(
                        selectedVehicle.location, 
                        employeeLocation || mockEmployeeLocation
                      ) / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">ETA</span>
                    <span className="font-medium">
                      {calculateETA(
                        calculateDistance(
                          selectedVehicle.location, 
                          employeeLocation || mockEmployeeLocation
                        ),
                        selectedVehicle.location.speed || 0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Vehicle selection for employees if there are multiple vehicles */}
        {!isDriver && vehicles && vehicles.length > 1 && (
          <div className="absolute top-4 right-4">
            {/* Vehicle selection UI would go here */}
          </div>
        )}
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
    </div>
  );
};

export default MapComponent;
