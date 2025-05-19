
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import MapComponent from './MapComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockVehicles = [
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
];

const EmployeeDashboard: React.FC = () => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const requestLocation = () => {
    setIsLocating(true);
    
    // Simulate geolocation API (would be replaced with actual browser geolocation)
    setTimeout(() => {
      setCurrentLocation({
        latitude: 9.0155,
        longitude: 38.7632
      });
      setIsLocating(false);
      
      toast({
        title: 'Location Updated',
        description: 'Your current location has been updated.',
      });
    }, 1500);
  };
  
  // Request initial location when component mounts
  useEffect(() => {
    requestLocation();
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
              vehicles={mockVehicles}
              employeeLocation={currentLocation || undefined}
              employeeId="e1"
            />
          </div>
          {currentLocation && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Your Location</h3>
                    <p className="font-medium">
                      {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned Driver</h3>
                    <p className="font-medium">John Driver</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
