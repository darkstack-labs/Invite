import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Image, Play, Star, Eye, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';

const previewImages = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=500&fit=crop',
];

const DesktopSneakLayout = () => {
  const [currentPreview, setCurrentPreview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPreview((prev) => (prev + 1) % previewImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => setCurrentPreview((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  const handleNext = () => setCurrentPreview((prev) => (prev + 1) % previewImages.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-12 py-4 pb-24"
    >
      <div className="max-w-6xl w-full">
        <div className="mb-8">
          <PremiumHeading 
            title="Sneak Peek Gallery" 
            variant="desktop"
            showCrown={false}
          />
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left column - Countdown & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Countdown card */}
            <div className="card-shimmer rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-gold" />
                <span className="text-gold font-display text-xl">Reveals March 20</span>
              </div>
              <SneakCountdown />
            </div>

            {/* Only Photos and Videos */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Image, title: 'Photos' },
                { icon: Play, title: 'Videos' },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="card-shimmer rounded-xl p-4 text-center relative"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                  >
                    <item.icon className="w-8 h-8 text-gold mx-auto mb-2" />
                  </motion.div>
                  <p className="text-gold text-sm font-display">{item.title}</p>
                  <Lock className="w-3 h-3 text-gold/40 absolute top-2 right-2" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center - Main preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPreview}
                  src={previewImages[currentPreview]}
                  alt="Preview"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover filter blur-xl"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <Lock className="w-20 h-20 text-gold mb-4" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-6 h-6 text-champagne" />
                  </motion.div>
                </motion.div>
                <p className="text-gold font-display text-2xl mb-2">Locked Content</p>
                <p className="text-gold/60 text-sm">Exclusive behind-the-scenes</p>
              </div>

              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-gold hover:bg-gold/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-gold hover:bg-gold/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {previewImages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentPreview(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentPreview ? 'bg-gold w-6' : 'bg-gold/30'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* What's Coming */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-shimmer rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-gold" />
                <span className="text-gold font-display text-lg">What's Coming</span>
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-3 text-gold/80">
                  <Star className="w-4 h-4 text-copper flex-shrink-0" />
                  <span>Exclusive preparation photos</span>
                </li>
                <li className="flex items-center gap-3 text-gold/80">
                  <Star className="w-4 h-4 text-copper flex-shrink-0" />
                  <span>Behind-the-scenes video clips</span>
                </li>
                <li className="flex items-center gap-3 text-gold/80">
                  <Star className="w-4 h-4 text-copper flex-shrink-0" />
                  <span>Virtual venue walkthrough</span>
                </li>
                <li className="flex items-center gap-3 text-gold/80">
                  <Star className="w-4 h-4 text-copper flex-shrink-0" />
                  <span>Team highlights reel</span>
                </li>
              </ul>
            </motion.div>

            {/* Quote */}
            <motion.div
              animate={{ 
                opacity: [0.8, 1, 0.8],
                boxShadow: [
                  '0 0 20px rgba(212, 175, 55, 0.1)',
                  '0 0 40px rgba(212, 175, 55, 0.2)',
                  '0 0 20px rgba(212, 175, 55, 0.1)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="card-shimmer px-6 py-4"
            >
              <p className="text-gold italic text-lg">
                "The best surprises are worth waiting for..."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

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
            className="w-16 h-18 rounded-lg flex items-center justify-center text-2xl font-bold text-gold py-3"
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
          <span className="text-gold/60 text-xs mt-1 uppercase tracking-wider">{block.label}</span>
        </div>
      ))}
    </div>
  );
};

export default DesktopSneakLayout;
