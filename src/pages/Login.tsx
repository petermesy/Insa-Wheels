
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
