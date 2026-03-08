import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import { Skull, ShieldX, Ban, Frown } from 'lucide-react';

const roasts = [
  "You thought your name was on the list? That's the funniest thing we've heard all year.",
  "Even autocorrect wouldn't suggest your name for this party.",
  "We checked twice. Thrice. You're still not invited.",
  "The bouncer laughed when we showed him your name.",
  "This party has standards. And a guest list. You failed both.",
];

const Missing = () => {
  const navigate = useNavigate();
  const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

  return (
    <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center bg-fixed relative flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 bg-black/70 z-0" />
      <ParticleBackground count={30} />

      {/* Floating skulls */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-[1]"
          style={{ top: `${15 + i * 18}%`, left: `${10 + i * 17}%` }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
        >
          <Skull className="w-6 h-6 text-gold/10" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 max-w-md mx-4 text-center"
      >
        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-10 sm:px-10 sm:py-12"
          style={{
            background: 'linear-gradient(145deg, rgba(10,10,10,0.98), rgba(0,0,0,0.99))',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            boxShadow: '0 0 60px rgba(212,175,55,0.08), 0 20px 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,50,50,0.5), transparent)' }} />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="mb-6"
          >
            <motion.div
              animate={{
                filter: [
                  'drop-shadow(0 0 8px rgba(220,50,50,0.3))',
                  'drop-shadow(0 0 20px rgba(220,50,50,0.6))',
                  'drop-shadow(0 0 8px rgba(220,50,50,0.3))',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShieldX className="w-16 h-16 text-red-400/80 mx-auto" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-cinzel text-2xl sm:text-3xl tracking-wider mb-2"
            style={{ color: 'hsl(45 100% 50%)' }}
          >
            ACCESS DENIED
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-red-400/60 text-xs uppercase tracking-[0.3em] mb-6 font-cinzel"
          >
            Invitation not found
          </motion.p>

          {/* Divider */}
          <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />

          {/* Roast */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 px-2"
          >
            <p className="text-champagne/70 text-sm md:text-base leading-relaxed italic">
              "{randomRoast}"
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {[
              { label: 'Invite Status', value: 'DENIED', icon: <Ban className="w-3.5 h-3.5" /> },
              { label: 'VIP Level', value: 'ZERO', icon: <Frown className="w-3.5 h-3.5" /> },
              { label: 'Chances Left', value: 'NONE', icon: <Skull className="w-3.5 h-3.5" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-center py-3 rounded-lg"
                style={{
                  background: 'rgba(212,175,55,0.03)',
                  border: '1px solid rgba(212,175,55,0.08)',
                }}
              >
                <div className="text-red-400/50 flex justify-center mb-1">{stat.icon}</div>
                <p className="text-gold font-cinzel text-[10px] tracking-wider font-bold">{stat.value}</p>
                <p className="text-champagne/25 text-[8px] uppercase tracking-wider mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Closing line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-champagne/30 text-xs mb-6"
          >
            This party was curated for <span className="text-gold/60">legends</span>. You didn't make the cut.
          </motion.p>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="btn-gold px-8 py-3 rounded-xl text-sm font-bold tracking-wider"
          >
            Try Again (You'll Fail)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Missing;
