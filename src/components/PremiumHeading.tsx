import { motion } from 'framer-motion';
import { Sparkles, Crown, Star } from 'lucide-react';

interface PremiumHeadingProps {
  title: string;
  subtitle?: string;
  showCrown?: boolean;
  variant?: 'mobile' | 'tablet' | 'desktop';
}

// Inner star with sparkle decorations
const InnerStarDecoration = ({ side, size = 'md' }: { side: 'left' | 'right'; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: { star: 'w-3 h-3', sparkle: 'w-4 h-4' },
    md: { star: 'w-4 h-4', sparkle: 'w-5 h-5' },
    lg: { star: 'w-5 h-5', sparkle: 'w-7 h-7' },
  };

  const { star, sparkle } = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      {side === 'left' && (
        <>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles className={`${sparkle} text-muted-foreground`} />
          </motion.div>
        </>
      )}
      {side === 'right' && (
        <>
          <motion.div
            animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles className={`${sparkle} text-muted-foreground`} />
          </motion.div>
        </>
      )}
    </div>
  );
};

// Outer star (only for desktop)
const OuterStarDecoration = ({ side, size = 'md' }: { side: 'left' | 'right'; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      animate={{ rotate: side === 'left' ? 360 : -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <Star className={`${sizeMap[size]} text-muted-foreground fill-muted-foreground/30`} />
    </motion.div>
  );
};

const PremiumHeading = ({ title, subtitle, showCrown = true, variant = 'desktop' }: PremiumHeadingProps) => {
  const isDesktop = variant === 'desktop';
  const isTablet = variant === 'tablet';
  const isMobile = variant === 'mobile';

  // Size configurations
  const crownSize = isDesktop ? 'w-14 h-14' : isTablet ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = isDesktop ? 'text-5xl' : isTablet ? 'text-4xl' : 'text-2xl';
  const subtitleSize = isDesktop ? 'text-xl' : isTablet ? 'text-lg' : 'text-sm';
  const lineWidth = isDesktop ? 'w-48' : isTablet ? 'w-40' : 'w-32';
  const gap = isDesktop ? 'gap-6' : isTablet ? 'gap-4' : 'gap-3';
  const starSize = isDesktop ? 'lg' : isTablet ? 'md' : 'sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center ${isDesktop ? 'mb-12' : isTablet ? 'mb-10' : 'mb-6'}`}
    >
      {/* Crown with golden glow */}
      {showCrown && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={isDesktop ? 'mb-4' : isTablet ? 'mb-3' : 'mb-2'}
        >
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative inline-block"
          >
            <Crown 
              className={`${crownSize} text-gold mx-auto`} 
              style={{
                filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.7))'
              }}
            />
            {/* Golden glow effect behind crown */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Title with star decorations */}
      <motion.div 
        className={`flex items-center justify-center ${gap} mb-4`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
      >
        {/* Outer left star - desktop only */}
        {isDesktop && <OuterStarDecoration side="left" size={starSize as 'sm' | 'md' | 'lg'} />}
        
        {/* Inner left decorations */}
        <InnerStarDecoration side="left" size={starSize as 'sm' | 'md' | 'lg'} />
        
        {/* Title */}
        <h1 className={`font-display text-gradient-gold font-bold ${titleSize}`}>
          {title}
        </h1>
        
        {/* Inner right decorations */}
        <InnerStarDecoration side="right" size={starSize as 'sm' | 'md' | 'lg'} />
        
        {/* Outer right star - desktop only */}
        {isDesktop && <OuterStarDecoration side="right" size={starSize as 'sm' | 'md' | 'lg'} />}
      </motion.div>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-gold/70 italic ${subtitleSize}`}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className={`${lineWidth} h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4`}
      />
    </motion.div>
  );
};

export default PremiumHeading;
