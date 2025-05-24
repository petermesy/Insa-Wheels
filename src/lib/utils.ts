import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";

const socket = io('https://insa-wheels.onrender.com');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const LocationTrackingTab = () => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    // ...other socket logic...

    return () => {
      socket.disconnect();
    };
  }, []);

  // ...rest of your component...
};