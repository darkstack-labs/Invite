import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Image, Play, Star } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';

const previewImages = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
];

const releaseHighlights = [
  { icon: Image, title: 'Editorial Images', note: 'Reserved for the first look.' },
  { icon: Play, title: 'Signature Videos', note: 'Queued for a phased reveal.' },
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

      {/* Premium release card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card-shimmer rounded-xl p-4 mb-4 w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-4 h-4 text-gold" />
          <span className="text-gold text-sm font-display">Curated Reveal In Motion</span>
        </div>
        <p className="text-gold/80 text-sm leading-relaxed">
          The first look is being prepared for a polished guest-first release.
        </p>
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
            <p className="text-gold font-display text-lg">Private Preview</p>
            <p className="text-gold/65 text-sm mt-1">Reserved for the guest-first release</p>
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

      {/* Premium locked set */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {releaseHighlights.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="card-shimmer rounded-xl p-4 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
            >
              <item.icon className="w-8 h-8 text-gold mx-auto mb-2" />
            </motion.div>
            <p className="text-gold font-display">{item.title}</p>
            <p className="text-gold/55 text-[11px] mt-1">{item.note}</p>
            
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
            <span className="text-gold/60 text-xs">Guest-First Access</span>
            <Star className="w-3 h-3 text-gold/60" />
          </div>
          <p className="text-gold/80 italic text-sm">
            "The strongest reveals arrive with timing."
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileSneakLayout;
