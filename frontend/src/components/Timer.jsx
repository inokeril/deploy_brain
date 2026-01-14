import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Timer = ({ isRunning, onUpdate, initialTime = 0 }) => {
  const [time, setTime] = useState(initialTime);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      // Start the timer
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setTime(elapsed);
        onUpdate?.(elapsed);
      }, 10);
    } else {
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onUpdate]);

  // Reset time when initialTime changes to 0
  useEffect(() => {
    if (initialTime === 0) {
      setTime(0);
    }
  }, [initialTime]);

  // Format time display
  const formatTime = () => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((time % 1000) / 10);

    return (
      <>
        <span className="tabular-nums">
          {minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-muted-foreground/70">:</span>
        <span className="tabular-nums">
          {seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-muted-foreground/70">.</span>
        <span className="tabular-nums text-muted-foreground">
          {centiseconds.toString().padStart(2, '0')}
        </span>
      </>
    );
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50",
      "font-mono text-lg sm:text-xl",
      isRunning && "animate-pulse-soft"
    )}>
      <Clock 
        size={18} 
        className={cn(
          "text-muted-foreground",
          isRunning && "text-primary"
        )} 
      />
      <span className="text-foreground">
        {formatTime()}
      </span>
    </div>
  );
};

export default Timer;
