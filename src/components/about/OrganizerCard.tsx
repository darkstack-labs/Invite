import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Palette, Code, MapPin, Users, Megaphone, Star, Sparkles } from 'lucide-react';
import type { Organizer } from '@/pages/About';

const avatarIconMap: Record<string, React.ReactNode> = {
  crown: <Crown className="w-full h-full text-gold" />,
  palette: <Palette className="w-full h-full text-gold" />,
  code: <Code className="w-full h-full text-gold" />,
  mappin: <MapPin className="w-full h-full text-gold" />,
  users: <Users className="w-full h-full text-gold" />,
  megaphone: <Megaphone className="w-full h-full text-gold" />,
};

interface OrganizerCardProps {
  organizer: Organizer;
  index: number;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

const OrganizerCard = ({ organizer, index, onClick, size = 'medium' }: OrganizerCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const sizeClasses = {
    small: 'h-14',
    medium: 'h-16',
    large: 'h-20'
  };

  const avatarSizes = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-10 h-10 text-xl',
    large: 'w-12 h-12 text-2xl'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="perspective-1000"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Front of Card */}
        <motion.button
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClick}
          className={`btn-gold ${sizeClasses[size]} w-full rounded-xl font-semibold flex items-center justify-center gap-3 relative overflow-hidden backface-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Avatar */}
          <div className={`${avatarSizes[size]} rounded-full bg-black/30 flex items-center justify-center border border-gold/30 p-1.5`}>
            {avatarIconMap[organizer.avatar] || <Crown className="w-full h-full text-gold" />}
          </div>
          
          <span className={textSizes[size]}>{organizer.name}</span>
          
          <motion.div
            className="absolute right-4"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          >
            <Star className="w-4 h-4 text-champagne/60 fill-champagne/30" />
          </motion.div>
        </motion.button>

        {/* Back of Card (shown on hover) */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} w-full rounded-xl bg-gradient-to-r from-gold/20 to-copper/20 border-2 border-gold/40 flex items-center justify-center gap-2 px-4 backface-hidden`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Sparkles className="w-4 h-4 text-gold/60" />
          <span className="text-gold/80 text-sm truncate">{organizer.role}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OrganizerCard;
