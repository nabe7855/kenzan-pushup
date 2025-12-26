import React, { useEffect, useState } from "react";

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        size: Math.random() * 10 + 5,
        color: ["#f59e0b", "#dc2626", "#ffffff", "#fbbf24"][
          Math.floor(Math.random() * 4)
        ],
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
