import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Image, Play, Star } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import CountdownTimer from '@/components/CountdownTimer';

const previewImages = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
];

const MobileSneakLayout = () => {
  const [currentPreview, setCurrentPreview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPreview((prev) => (prev + 1) % previewImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-[4vw] py-4 text-center pb-24"
    >
      <PremiumHeading 
        title="Sneak Peek" 
        variant="mobile"
        showCrown={false}
      />

      {/* Countdown to reveal - March 20 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card-shimmer rounded-xl p-4 mb-4 w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-4 h-4 text-gold" />
          <span className="text-gold text-sm font-display">Content Reveals On March 20</span>
        </div>
        <SneakCountdown />
      </motion.div>

      {/* Blurred preview gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPreview}
              src={previewImages[currentPreview]}
              alt="Preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover filter blur-xl scale-110"
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Lock className="w-12 h-12 text-gold mb-3" />
            </motion.div>
            <p className="text-gold font-display text-lg">Locked Content</p>
            <p className="text-gold/60 text-sm mt-1">Behind-the-scenes coming soon</p>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {previewImages.map((_, idx) => (
              <motion.div
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === currentPreview ? 'bg-gold' : 'bg-gold/30'}`}
                animate={idx === currentPreview ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Only Photos and Videos */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {[
          { icon: Image, title: 'Photos' },
          { icon: Play, title: 'Videos' },
        ].map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="card-shimmer rounded-xl p-4 relative overflow-hidden"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
            >
              <item.icon className="w-8 h-8 text-gold mx-auto mb-2" />
            </motion.div>
            <p className="text-gold font-display">{item.title}</p>
            
            <div className="absolute top-2 right-2">
              <Lock className="w-3 h-3 text-gold/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Teaser quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 w-full"
      >
        <motion.div
          animate={{ 
            opacity: [0.7, 1, 0.7],
            boxShadow: [
              '0 0 10px rgba(212, 175, 55, 0.1)',
              '0 0 20px rgba(212, 175, 55, 0.2)',
              '0 0 10px rgba(212, 175, 55, 0.1)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="card-shimmer px-4 py-3"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="w-3 h-3 text-gold/60" />
            <span className="text-gold/60 text-xs">Coming Soon</span>
            <Star className="w-3 h-3 text-gold/60" />
          </div>
          <p className="text-gold/80 italic text-sm">
            "The best surprises are worth waiting for..."
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Countdown component for March 20 reveal
const SneakCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const target = new Date('2026-03-20T00:00:00+05:30');
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const s = Math.floor(diff / 1000);
      setTimeLeft({
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex justify-center gap-3 mt-2">
      {[
        { label: 'Days', value: timeLeft.days },
      ].map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <motion.div
            className="w-12 h-14 rounded-lg flex items-center justify-center text-xl font-bold text-gold"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(0,0,0,0.6))',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
            animate={{ 
              boxShadow: [
                '0 0 5px rgba(212, 175, 55, 0.2)',
                '0 0 15px rgba(212, 175, 55, 0.4)',
                '0 0 5px rgba(212, 175, 55, 0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {String(block.value).padStart(2, '0')}
          </motion.div>
          <span className="text-gold/60 text-[10px] mt-1 uppercase tracking-wider">{block.label}</span>
        </div>
      ))}
    </div>
  );
};

export default MobileSneakLayout;
