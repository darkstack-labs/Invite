import { motion } from 'framer-motion';

interface CocktailGlassProps {
  className?: string;
}

const CocktailGlass = ({ className = '' }: CocktailGlassProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Glass */}
      <div className="relative w-9 h-20 border-[3px] border-gold border-b-0 rounded-b-[20px] overflow-hidden bg-transparent">
        {/* Liquid */}
        <motion.div
          className="absolute bottom-0 w-full bg-gradient-to-t from-gold to-gold-light rounded-b-[16px]"
          animate={{ height: ['60%', '68%', '60%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Bubbles */}
        {[8, 16, 24].map((left, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-champagne/80 rounded-full"
            style={{ left, bottom: 10 }}
            animate={{ y: [0, -40], opacity: [0.8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
      
      {/* Stem */}
      <div className="w-1.5 h-6 bg-gold mx-auto" />
      
      {/* Base */}
      <div className="w-11 h-1.5 bg-gold mx-auto rounded-full" />
    </div>
  );
};

export default CocktailGlass;
