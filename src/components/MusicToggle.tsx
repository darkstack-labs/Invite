import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSounds } from './SoundManager';

interface MusicToggleProps {
  onToggle: () => void;
  isPlaying: boolean;
}

const MusicToggle = ({ onToggle, isPlaying }: MusicToggleProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: isPlaying 
          ? '0 0 20px rgba(212, 175, 55, 0.4)' 
          : '0 0 10px rgba(0, 0, 0, 0.5)',
      }}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      <motion.div
        animate={isPlaying ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-gold" />
        ) : (
          <VolumeX className="w-5 h-5 text-gold/60" />
        )}
      </motion.div>
      
      {/* Sound waves animation */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full border border-gold/30"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default MusicToggle;
