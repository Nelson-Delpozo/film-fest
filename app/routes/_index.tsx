// app/routes/_index.tsx
import { useEffect, useState } from "react";

export default function LandingPage() {
  // Target date and time (10 AM on December 1, 2025)
  const targetDate = new Date("2025-12-01T10:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeft() {
    const difference = targetDate - new Date().getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-600 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">MNFF</h1>
        <h2 className="text-xl font-light">this one&apos;s gonna hit different</h2>
      </header>

      <div className="text-3xl font-semibold mb-6">
        {timeLeft ? (
          <div>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
        ) : (
          <div>it&apos;s on come join us</div>
        )}
      </div>
    </div>
  );
}
