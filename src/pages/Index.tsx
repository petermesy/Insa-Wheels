
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <section className="relative bg-gradient-to-r from-primary to-insa-purple pt-16 md:pt-24 pb-20 md:pb-32 px-4">
          <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                INSA-Wheels Tracker
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-white/90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                A real-time transportation tracking system for INSA employees.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/login">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                    Register
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center">
              <motion.div 
                className="relative w-full max-w-[400px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20">
                  <img 
                    src="/lovable-uploads/7005b12f-21eb-4f24-8a3c-e6abefc0551a.png" 
                    alt="INSA Wheels Tracker Logo" 
                    className="w-full h-auto p-8 bg-white"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  Live
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">For Employees</h3>
                <p className="text-gray-600">
                  Track your assigned transportation service in real-time. See the vehicle's location, estimated arrival time, and distance from your location.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">For Drivers</h3>
                <p className="text-gray-600">
                  Share your location with assigned employees. Access your route and see who you need to pick up on your journey.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">For Administrators</h3>
                <p className="text-gray-600">
                  Manage drivers, employees, and vehicles. Assign employees to drivers and monitor the entire transportation system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2025 INSA-Wheels Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
