import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';
import ChampagneToast from '@/components/ChampagneToast';
import PremiumHeading from '@/components/PremiumHeading';
import { Star, Crown } from 'lucide-react';

interface MobileHomeLayoutProps {
  userName?: string;
}

const MobileHomeLayout = ({ userName }: MobileHomeLayoutProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-[4vw] py-4 overflow-hidden"
    >
      {/* Subtle radial glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Premium Heading */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="relative z-10"
      >
        <PremiumHeading 
          title="The Worst Batch" 
          subtitle="Signing Off"
          variant="mobile"
        />
      </motion.div>

      {/* Champagne Toast */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
        className="mt-[0.5vh] relative z-10"
      >
        <ChampagneToast size="sm" />
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full mt-[0.5vh] relative z-10"
      >
        <CountdownTimer />
      </motion.div>

      {/* Event Info - Minimal & Clean */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-[3vh] text-center space-y-[0.8vh] relative z-10"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold/30" />
          <p className="font-cinzel text-gold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 4vw, 1.4rem)' }}>
            24th March 2026
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold/30" />
        </div>
        <p className="text-muted-foreground" style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1.15rem)' }}>
          4:00 PM — 8:30 PM
        </p>
        <p className="text-champagne/70 font-medium tracking-wide" style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1.15rem)' }}>
          HASAPI, De' Hamrey
        </p>
      </motion.div>

      {/* Welcome Card - Elegant & Minimal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-[4vh] text-center relative z-10 rounded-xl px-8 py-5"
        style={{
          background: 'linear-gradient(160deg, rgba(212,175,55,0.04), rgba(0,0,0,0.3))',
          border: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <motion.div
          className="absolute top-2 right-3"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Crown className="w-3.5 h-3.5 text-gold/25" />
        </motion.div>
        <p className="text-gold/60 text-xs tracking-[0.2em] uppercase mb-1">Welcome</p>
        <p className="font-display text-gradient-gold" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)' }}>{userName}</p>
      </motion.div>
    </motion.div>
  );
};

export default MobileHomeLayout;
