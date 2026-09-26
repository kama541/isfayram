import { useState, useEffect } from 'react';

interface TimeElapsedProps {
  createdAt: string;
}

export const TimeElapsed = ({ createdAt }: TimeElapsedProps) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const diff = Date.now() - new Date(createdAt).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setElapsed(`${hours} soat, ${minutes} daq`);
      } else {
        setElapsed(`${minutes} daq`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return <span>{elapsed}</span>;
};
