import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeBlock {
  label: string;
  value: string;
}

const CountdownTimer = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    const updateCountdown = () => {
      const eventDate = new Date('2026-03-24T16:00:00+05:30');
      const now = new Date();
      const distance = eventDate.getTime() - now.getTime();

      if (distance < 0) {
        setTimeBlocks([
          { label: 'Days', value: '00' },
          { label: 'Hours', value: '00' },
          { label: 'Minutes', value: '00' },
          { label: 'Seconds', value: '00' },
        ]);
        return;
      }

      const totalSeconds = Math.floor(distance / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeBlocks([
        { label: 'Days', value: days.toString().padStart(2, '0') },
        { label: 'Hours', value: hours.toString().padStart(2, '0') },
        { label: 'Minutes', value: minutes.toString().padStart(2, '0') },
        { label: 'Seconds', value: seconds.toString().padStart(2, '0') },
      ]);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full mt-4 px-2">
      <div className="flex justify-center gap-1 sm:gap-2">
        {timeBlocks.map((block, index) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex gap-px">
              {block.value.split('').map((digit, digitIndex) => (
                <motion.div
                  key={digitIndex}
                  className="digit-box flex items-center justify-center text-gold font-display font-bold"
                  style={{ 
                    width: 'clamp(1.8rem, 10vw, 4rem)',
                    height: 'clamp(2.5rem, 14vw, 5.5rem)',
                    fontSize: 'clamp(1.2rem, 6vw, 2.8rem)'
                  }}
                  animate={{ 
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      '0 0 5px rgba(212, 175, 55, 0.3), 0 0 10px rgba(212, 175, 55, 0.2)',
                      '0 0 15px rgba(212, 175, 55, 0.6), 0 0 30px rgba(212, 175, 55, 0.4), 0 0 45px rgba(212, 175, 55, 0.2)',
                      '0 0 5px rgba(212, 175, 55, 0.3), 0 0 10px rgba(212, 175, 55, 0.2)'
                    ]
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {digit}
                </motion.div>
              ))}
            </div>
            <span 
              className="mt-1 text-gold uppercase tracking-widest font-medium"
              style={{ fontSize: 'clamp(0.5rem, 2vw, 0.75rem)' }}
            >
              {block.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
