import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';
import ChampagneToast from '@/components/ChampagneToast';
import PremiumHeading from '@/components/PremiumHeading';
import { Calendar, MapPin, Sparkles, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TabletHomeLayoutProps {
  userName?: string;
}

const TabletHomeLayout = ({ userName }: TabletHomeLayoutProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-8 py-4 overflow-hidden"
    >
      {/* Radial glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07), transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      {/* Parallax Background Layers */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-16 left-[12%] w-2.5 h-2.5 bg-gold/18 rounded-full" />
        <div className="absolute top-28 right-[18%] w-3.5 h-3.5 bg-gold/12 rounded-full" />
        <div className="absolute top-[35%] left-[8%] w-2 h-2 bg-gold/22 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-[45%] right-[12%] w-2.5 h-2.5 bg-champagne/12 rounded-full" />
        <div className="absolute top-[55%] left-[18%] w-2 h-2 bg-gold/18 rounded-full" />
        <div className="absolute bottom-[32%] right-[22%] w-1.5 h-1.5 bg-champagne/18 rounded-full" />
      </motion.div>

      <div className="max-w-2xl w-full flex flex-col items-center gap-2 relative z-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          <PremiumHeading 
            title="The Worst Batch" 
            subtitle="Signing Off"
            variant="tablet"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
        >
          <ChampagneToast size="md" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full"
        >
          <CountdownTimer />
        </motion.div>

        <div className="w-full grid grid-cols-2 gap-6 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="card-shimmer p-6 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-2 right-2"
              animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-4 h-4 text-muted-foreground/40 fill-muted-foreground/20" />
            </motion.div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={{ boxShadow: ['0 0 10px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.4)', '0 0 10px rgba(212,175,55,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Calendar className="w-5 h-5 text-gold" />
                </motion.div>
                <div>
                  <p className="text-xl font-display text-gold">24th March 2026</p>
                  <p className="text-sm text-muted-foreground">4:00 PM - 8:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  animate={{ boxShadow: ['0 0 10px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.4)', '0 0 10px rgba(212,175,55,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <MapPin className="w-5 h-5 text-gold" />
                </motion.div>
                <p className="text-lg text-gold-light font-medium">HASAPI, De' Hamrey</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="card-shimmer px-6 py-6 flex flex-col justify-center relative overflow-hidden"
          >
            <motion.div
              className="absolute top-2 right-2"
              animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-muted-foreground/60" />
            </motion.div>
            <motion.div
              className="absolute bottom-2 left-2"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-3.5 h-3.5 text-gold/30" />
            </motion.div>
            <p className="text-gold">Welcome to the celebration</p>
            <p className="text-3xl font-display text-gradient-gold mt-2">{userName}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4"
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="card-shimmer px-6 py-3"
          >
            <p className="text-center italic text-muted-foreground text-lg">
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
          className="mt-1 px-6 py-2.5 rounded-lg border border-gold/30 text-gold bg-black/30 hover:bg-black/50 hover:text-champagne transition-colors"
        >
          Ready for games?
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TabletHomeLayout;
