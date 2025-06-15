'use client';

import { useState, useEffect } from 'react';

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set up an interval to update the time every second
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(timerId);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  const formatDate = (date) => {
    // Formats the date to a readable string, e.g., "Monday, June 16, 2025"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (date) => {
    // Formats the time to a readable string, e.g., "10:30:55 AM"
    return date.toLocaleTimeString('en-US');
  };

  return (
    <div className="hidden md:flex items-center text-sm text-gray-500">
        <span>{formatDate(currentTime)}</span>
        <span className="mx-2">|</span>
        <span>{formatTime(currentTime)}</span>
    </div>
  );
};

export default RealTimeClock;
