
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import MapComponent from './MapComponent';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockAssignedEmployees = [
  { id: 'e1', name: 'Alice Employee', department: 'IT' },
  { id: 'e2', name: 'Bob Employee', department: 'HR' },
];

const DriverDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; speed: number } | null>(null);
  
  // Simulate location updates
  useEffect(() => {
    // Set initial location (this would be replaced with real geolocation)
    setCurrentLocation({
      latitude: 9.0105,
      longitude: 38.7652,
      speed: 35
    });
    
    // Simulate location changes
    const locationInterval = setInterval(() => {
      // Small random movement
      setCurrentLocation(prev => {
        if (!prev) return prev;
        return {
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
          speed: Math.max(0, Math.min(80, prev.speed + (Math.random() - 0.5) * 5))
        };
      });
    }, 3000);
    
    return () => {
      clearInterval(locationInterval);
    };
  }, []);
  
  const toggleSharing = () => {
    setIsSharing(!isSharing);
    if (!isSharing) {
      toast({
        title: 'Location Sharing Enabled',
        description: 'Your location is now being shared with assigned employees.',
      });
    } else {
      toast({
        title: 'Location Sharing Disabled',
        description: 'Your location is no longer being shared with employees.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Driver Dashboard</CardTitle>
              <CardDescription>
                Manage your location sharing and view assigned employees
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Switch 
                id="location-sharing" 
                checked={isSharing} 
                onCheckedChange={toggleSharing}
              />
              <Label htmlFor="location-sharing" className="font-medium">
                Location Sharing
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="map">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="employees">Assigned Employees</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="space-y-4">
              <div className="h-[500px] w-full">
                <MapComponent 
                  isDriver={true}
                  driverId="d1"
                  vehicles={[]}
                  employeeLocation={currentLocation || undefined}
                />
              </div>
              {currentLocation && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Current Location</h3>
                        <p className="font-medium">
                          {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Current Speed</h3>
                        <p className="font-medium">{currentLocation.speed.toFixed(1)} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="employees" className="space-y-4">
              {mockAssignedEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAssignedEmployees.map(employee => (
                    <Card key={employee.id}>
                      <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="space-y-1">
                          <h3 className="font-medium">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Button variant="outline" size="sm">View Location</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No employees assigned to you yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
