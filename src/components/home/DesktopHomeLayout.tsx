import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';
import ChampagneToast from '@/components/ChampagneToast';
import PremiumHeading from '@/components/PremiumHeading';
import { Calendar, MapPin, Sparkles, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DesktopHomeLayoutProps {
  userName?: string;
}

const DesktopHomeLayout = ({ userName }: DesktopHomeLayoutProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-center justify-center min-h-[calc(100dvh-5rem)] px-8 py-4 overflow-hidden"
    >
      {/* Grand radial glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Parallax Background Layers */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-20 left-[10%] w-3 h-3 bg-gold/15 rounded-full" />
        <div className="absolute top-32 right-[20%] w-4 h-4 bg-gold/10 rounded-full" />
        <div className="absolute top-[40%] left-[5%] w-2 h-2 bg-gold/20 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-[30%] right-[10%] w-3 h-3 bg-champagne/10 rounded-full" />
        <div className="absolute top-[60%] left-[15%] w-2.5 h-2.5 bg-gold/15 rounded-full" />
        <div className="absolute bottom-[35%] right-[25%] w-2 h-2 bg-champagne/15 rounded-full" />
      </motion.div>

      <div className="max-w-6xl w-full grid grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, type: 'spring' }}
          className="flex flex-col gap-8"
        >
          <motion.div 
            className="text-left"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <PremiumHeading 
              title="The Worst Batch" 
              subtitle="Signing Off"
              variant="desktop"
            />
          </motion.div>

          {/* Event Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -6 }}
            className="card-shimmer p-8 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-3 right-3"
              animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-muted-foreground/40 fill-muted-foreground/20" />
            </motion.div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center icon-glow"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  animate={{ boxShadow: ['0 0 15px rgba(212,175,55,0.2)', '0 0 30px rgba(212,175,55,0.4)', '0 0 15px rgba(212,175,55,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Calendar className="w-6 h-6 text-gold" />
                </motion.div>
                <div>
                  <p className="text-2xl font-display text-gold">24th March 2026</p>
                  <p className="text-muted-foreground">4:00 PM - 8:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center icon-glow"
                  whileHover={{ scale: 1.15, rotate: -10 }}
                  animate={{ boxShadow: ['0 0 15px rgba(212,175,55,0.2)', '0 0 30px rgba(212,175,55,0.4)', '0 0 15px rgba(212,175,55,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <MapPin className="w-6 h-6 text-gold" />
                </motion.div>
                <p className="text-xl text-gold-light font-medium">HASAPI, De' Hamrey</p>
              </div>
            </div>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.6 },
              scale: { duration: 0.5, delay: 0.6 },
              y: { delay: 2, duration: 1.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }
            }}
            whileHover={{ scale: 1.02 }}
            className="card-shimmer px-8 py-6 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-3 right-3"
              animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </motion.div>
            <motion.div
              className="absolute bottom-3 left-3"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-4 h-4 text-gold/30" />
            </motion.div>
            <p className="text-gold text-lg">Welcome to the celebration</p>
            <p className="text-4xl font-display text-gradient-gold mt-2">{userName}</p>
          </motion.div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, type: 'spring' }}
          className="flex flex-col items-center gap-2"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
          >
            <ChampagneToast size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full"
          >
            <CountdownTimer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-4"
          >
            <motion.div
              animate={{ 
                opacity: [0.7, 1, 0.7],
                boxShadow: ['0 0 20px rgba(212,175,55,0.1)', '0 0 40px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.1)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="card-shimmer px-8 py-4"
            >
              <p className="text-center italic text-muted-foreground text-lg max-w-md">
                "Let's make the evening memorable..."
              </p>
            </motion.div>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={() => navigate('/games')}
            className="mt-1 px-7 py-3 rounded-lg border border-gold/30 text-gold bg-black/30 hover:bg-black/50 hover:text-champagne transition-colors"
          >
            Ready for games?
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DesktopHomeLayout;
