import { useEffect, useState } from "react";

type CountdownReturn = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
};

/**
 * A hook that counts down to a target date
 * @param targetDate - The future date to count down to
 * @returns An object with the remaining time in different units
 */
export function useCountdown(targetDate: Date | number): CountdownReturn {
  const [timeLeft, setTimeLeft] = useState<CountdownReturn>(
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    // Set up interval to update every second
    const timer = setInterval(() => {
      const updated = calculateTimeLeft(targetDate);
      setTimeLeft(updated);

      // Clear interval if countdown is expired
      if (updated.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date | number): CountdownReturn {
  const difference = +new Date(targetDate) - +new Date();

  // If the target date is in the past
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: "00:00:00:00",
    };
  }

  // Calculate time units
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  // Format the time for display
  const formatted = [
    days.toString().padStart(2, "0"),
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted,
  };
}
