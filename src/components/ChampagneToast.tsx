import { motion } from 'framer-motion';

interface ChampagneToastProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ChampagneToast = ({ className = '', size = 'md' }: ChampagneToastProps) => {
  const sizeClasses = {
    sm: 'w-40 h-40',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer luxurious glow */}
      <motion.div
        className="absolute inset-[-20%] bg-gradient-radial from-gold/30 via-champagne/15 to-transparent rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner warm glow */}
      <motion.div
        className="absolute inset-[10%] bg-gradient-radial from-amber-400/20 via-gold/10 to-transparent rounded-full blur-2xl"
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.6, 0.4, 0.6] 
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <svg
        viewBox="0 0 240 200"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Luxury floating particles */}
        {[...Array(20)].map((_, i) => {
          const baseX = 120 + Math.cos((i * 18 * Math.PI) / 180) * (60 + (i % 4) * 15);
          const baseY = 80 + Math.sin((i * 18 * Math.PI) / 180) * (40 + (i % 3) * 10);
          return (
            <motion.circle
              key={`luxury-particle-${i}`}
              cx={baseX}
              cy={baseY}
              r={0.8 + (i % 3) * 0.6}
              fill={i % 2 === 0 ? "url(#premiumGold)" : "rgba(255,255,255,0.8)"}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [0, -15 - (i % 3) * 5, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5 + (i % 3) * 0.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Left Champagne Coupe */}
        <motion.g
          animate={{ 
            rotate: [12, 18, 12],
            x: [0, 3, 0],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: 'easeInOut' 
          }}
          style={{ transformOrigin: '85px 160px' }}
        >
          {/* Bowl - elegant coupe shape */}
          <path
            d="M55 55 Q55 45 85 42 Q115 45 115 55 L110 85 Q105 100 85 105 Q65 100 60 85 Z"
            fill="url(#crystalBowl)"
            stroke="url(#premiumRim)"
            strokeWidth="1.5"
          />
          
          {/* Inner glass reflection */}
          <path
            d="M60 54 Q60 48 85 46 Q110 48 110 54 L106 82 Q102 94 85 98 Q68 94 64 82 Z"
            fill="url(#innerReflection)"
            opacity="0.4"
          />
          
          {/* Champagne liquid with shimmer */}
          <motion.path
            d="M63 60 Q63 56 85 54 Q107 56 107 60 L104 80 Q100 92 85 95 Q70 92 66 80 Z"
            fill="url(#liquidPremium)"
            animate={{
              d: [
                "M63 60 Q63 56 85 54 Q107 56 107 60 L104 80 Q100 92 85 95 Q70 92 66 80 Z",
                "M63 58 Q63 54 85 52 Q107 54 107 58 L104 80 Q100 92 85 95 Q70 92 66 80 Z",
                "M63 60 Q63 56 85 54 Q107 56 107 60 L104 80 Q100 92 85 95 Q70 92 66 80 Z",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Liquid surface shimmer */}
          <motion.ellipse
            cx="85"
            cy="58"
            rx="20"
            ry="4"
            fill="url(#surfaceShimmer)"
            opacity="0.6"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Premium bubbles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`left-premium-bubble-${i}`}
              cx={72 + i * 6}
              r={1.2 + (i % 2) * 0.4}
              fill="rgba(255,255,255,0.85)"
              initial={{ cy: 88, opacity: 0.9 }}
              animate={{ cy: 55, opacity: 0, scale: [1, 1.3, 0.8] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
          
          {/* Elegant stem */}
          <path
            d="M82 105 L82 108 Q80 115 80 125 L80 155 Q80 158 85 158 Q90 158 90 155 L90 125 Q90 115 88 108 L88 105"
            fill="url(#premiumStem)"
          />
          
          {/* Ornate base */}
          <ellipse cx="85" cy="162" rx="18" ry="5" fill="url(#luxuryBase)" />
          <ellipse cx="85" cy="160" rx="14" ry="3" fill="url(#baseHighlight)" opacity="0.5" />
          
          {/* Glass highlight streaks */}
          <path d="M62 52 Q65 70 68 85" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M108 52 Q105 65 104 75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Right Champagne Coupe */}
        <motion.g
          animate={{ 
            rotate: [-12, -18, -12],
            x: [0, -3, 0],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: 'easeInOut' 
          }}
          style={{ transformOrigin: '155px 160px' }}
        >
          {/* Bowl - elegant coupe shape */}
          <path
            d="M125 55 Q125 45 155 42 Q185 45 185 55 L180 85 Q175 100 155 105 Q135 100 130 85 Z"
            fill="url(#crystalBowl)"
            stroke="url(#premiumRim)"
            strokeWidth="1.5"
          />
          
          {/* Inner glass reflection */}
          <path
            d="M130 54 Q130 48 155 46 Q180 48 180 54 L176 82 Q172 94 155 98 Q138 94 134 82 Z"
            fill="url(#innerReflection)"
            opacity="0.4"
          />
          
          {/* Champagne liquid with shimmer */}
          <motion.path
            d="M133 60 Q133 56 155 54 Q177 56 177 60 L174 80 Q170 92 155 95 Q140 92 136 80 Z"
            fill="url(#liquidPremium)"
            animate={{
              d: [
                "M133 60 Q133 56 155 54 Q177 56 177 60 L174 80 Q170 92 155 95 Q140 92 136 80 Z",
                "M133 62 Q133 58 155 56 Q177 58 177 62 L174 80 Q170 92 155 95 Q140 92 136 80 Z",
                "M133 60 Q133 56 155 54 Q177 56 177 60 L174 80 Q170 92 155 95 Q140 92 136 80 Z",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          
          {/* Liquid surface shimmer */}
          <motion.ellipse
            cx="155"
            cy="58"
            rx="20"
            ry="4"
            fill="url(#surfaceShimmer)"
            opacity="0.6"
            animate={{ opacity: [0.6, 0.4, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Premium bubbles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`right-premium-bubble-${i}`}
              cx={142 + i * 6}
              r={1.2 + (i % 2) * 0.4}
              fill="rgba(255,255,255,0.85)"
              initial={{ cy: 88, opacity: 0.9 }}
              animate={{ cy: 55, opacity: 0, scale: [1, 1.3, 0.8] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.3 + 0.15,
                ease: 'easeOut',
              }}
            />
          ))}
          
          {/* Elegant stem */}
          <path
            d="M152 105 L152 108 Q150 115 150 125 L150 155 Q150 158 155 158 Q160 158 160 155 L160 125 Q160 115 158 108 L158 105"
            fill="url(#premiumStem)"
          />
          
          {/* Ornate base */}
          <ellipse cx="155" cy="162" rx="18" ry="5" fill="url(#luxuryBase)" />
          <ellipse cx="155" cy="160" rx="14" ry="3" fill="url(#baseHighlight)" opacity="0.5" />
          
          {/* Glass highlight streaks */}
          <path d="M178 52 Q175 70 172 85" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M132 52 Q135 65 136 75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Premium clink effect - diamond sparkle */}
        <motion.g>
          {/* Diamond sparkle rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.line
              key={`diamond-ray-${i}`}
              x1={120}
              y1={48}
              x2={120 + Math.cos((angle * Math.PI) / 180) * 5}
              y2={48 + Math.sin((angle * Math.PI) / 180) * 5}
              stroke={i % 2 === 0 ? "url(#premiumGold)" : "white"}
              strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 1, 0],
                x2: [120, 120 + Math.cos((angle * Math.PI) / 180) * (i % 2 === 0 ? 25 : 15), 120 + Math.cos((angle * Math.PI) / 180) * 30],
                y2: [48, 48 + Math.sin((angle * Math.PI) / 180) * (i % 2 === 0 ? 25 : 15), 48 + Math.sin((angle * Math.PI) / 180) * 30],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 3.5,
                delay: 1.5 + i * 0.03,
                ease: 'easeOut',
              }}
            />
          ))}
          
          {/* Central diamond flash */}
          <motion.path
            d="M120 40 L125 48 L120 56 L115 48 Z"
            fill="white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 3.7,
              delay: 1.4,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: '120px 48px' }}
          />
          
          {/* Secondary sparkle ring */}
          <motion.circle
            cx={120}
            cy={48}
            r={8}
            fill="none"
            stroke="url(#premiumGold)"
            strokeWidth="1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 3, 4],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 3.3,
              delay: 1.5,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: '120px 48px' }}
          />
        </motion.g>

        {/* Premium Gradient Definitions */}
        <defs>
          <linearGradient id="premiumGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="25%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#F4E4BC" />
            <stop offset="75%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          
          <linearGradient id="liquidPremium" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E7" stopOpacity="0.95" />
            <stop offset="20%" stopColor="#FFE4B5" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F4C430" stopOpacity="0.88" />
            <stop offset="80%" stopColor="#DAA520" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#B8860B" stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="crystalBowl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="70%" stopColor="rgba(212,175,55,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
          
          <linearGradient id="premiumRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="25%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFF8DC" />
            <stop offset="75%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          
          <radialGradient id="innerReflection" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          
          <linearGradient id="surfaceShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <linearGradient id="premiumStem" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(184,134,11,0.6)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="50%" stopColor="rgba(255,248,220,0.7)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(184,134,11,0.6)" />
          </linearGradient>

          <radialGradient id="luxuryBase" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#8B7355" />
          </radialGradient>
          
          <radialGradient id="baseHighlight" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="100%" stopColor="rgba(255,248,220,0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default ChampagneToast;
