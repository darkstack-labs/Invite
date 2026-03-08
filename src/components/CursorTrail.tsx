import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

interface TrailPoint extends CursorPosition {
  id: number;
}

const CursorTrail = () => {
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const idCounter = useRef(0);

  useEffect(() => {
    // Only show on desktop
    const checkDevice = () => {
      setIsVisible(window.innerWidth >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      
      const newTrail: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: idCounter.current++,
      };

      setTrails((prev) => [...prev.slice(-12), newTrail]);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkDevice);
    };
  }, [isVisible]);

  // Clean up old trails
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails((prev) => prev.slice(-8));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute rounded-full bg-gold"
          style={{
            left: trail.x - 4,
            top: trail.y - 4,
            width: 8 - index * 0.4,
            height: 8 - index * 0.4,
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)',
          }}
        />
      ))}
    </div>
  );
};

export default CursorTrail;
