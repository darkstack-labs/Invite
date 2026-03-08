import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Star } from 'lucide-react';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

const SplashScreen = ({ isVisible, onComplete }: SplashScreenProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          onAnimationComplete={() => !isVisible && onComplete()}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Animated background gradients */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.1) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, 50, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -100, -200],
              }}
              transition={{
                duration: 3,
                delay: i * 0.15,
                repeat: Infinity,
              }}
            />
          ))}

          {/* Main content */}
          <div className="relative z-10 text-center">
            {/* Crown animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))',
                    'drop-shadow(0 0 40px rgba(212, 175, 55, 0.9))',
                    'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-20 h-20 md:w-24 md:h-24 text-gold mx-auto" />
              </motion.div>
            </motion.div>

            {/* Stars around crown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                    top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Star className="w-3 h-3 text-champagne fill-champagne/50" />
                </motion.div>
              ))}
            </motion.div>

            {/* Title with letter animation */}
            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-cinzel text-4xl md:text-6xl font-bold text-gold tracking-wider mb-2"
                style={{
                  textShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
                }}
              >
                THE WORST BATCH
              </motion.h1>
            </motion.div>

            <motion.div className="overflow-hidden">
              <motion.p
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-display italic text-champagne/80 text-xl md:text-2xl"
              >
                ✦ Signing Off ✦
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 w-48 mx-auto"
            >
              <div className="h-1 bg-gold/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold via-champagne to-gold rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.2, duration: 1.5, ease: 'easeInOut' }}
                  onAnimationComplete={() => setTimeout(onComplete, 500)}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ delay: 1.3, duration: 1 }}
                className="text-gold/60 text-xs mt-3 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Preparing the celebration...
                <Sparkles className="w-3 h-3" />
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
