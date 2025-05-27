
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userType?: 'admin' | 'driver' | 'employee' | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userType, onLogout }) => {
  return (
    <header className="bg-primary text-primary-foreground py-2 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/7005b12f-21eb-4f24-8a3c-e6abefc0551a.png" 
            alt="INSA Wheels Tracker" 
            className="h-10 w-10"
          />
          <span className="text-xl font-bold hidden md:inline-block">INSA-Wheels Tracker</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {userType ? (
            <>
              <span className="hidden md:inline-block capitalize">
                {userType} Dashboard
              </span>
              {userType === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Admin Panel</Button>
                </Link>
              )}
              {userType === 'driver' && (
                <Link to="/driver">
                  <Button variant="ghost" size="sm">Driver Panel</Button>
                </Link>
              )}
              {userType === 'employee' && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">Track Vehicles</Button>
                </Link>
              )}
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
