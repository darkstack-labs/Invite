import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import eventIcon from '@/assets/event-icon.png';
import dresscodeIcon from '@/assets/dresscode-icon.png';
import menuIcon from '@/assets/menu-icon.png';
import rsvpIcon from '@/assets/rsvp-icon.png';

const activityCards = [
  { title: 'Party Details', subtitle: 'Date, time & venue', image: eventIcon, route: '/event-details', delay: 0.1 },
  { title: 'Dress Code', subtitle: 'What to wear', image: dresscodeIcon, route: '/dress-code', delay: 0.2 },
  { title: 'Menu', subtitle: 'Food & drinks', image: menuIcon, route: '/menu', delay: 0.3 },
  { title: 'RSVP', subtitle: 'Confirm attendance', image: rsvpIcon, route: '/rsvp', delay: 0.4 },
];

const MobileRegulationsLayout = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-[calc(100dvh-5rem)] px-4 py-6 overflow-y-auto"
    >
      {/* Premium Header */}
      <PremiumHeading 
        title="Activities" 
        subtitle="Explore what awaits you..."
        variant="mobile"
      />

      {/* Vertical Cards List - Single Column */}
      <div className="flex flex-col gap-6 w-full items-center">
        {activityCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: card.delay,
              duration: 0.5,
              type: 'spring',
              stiffness: 120
            }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.route)}
            className="w-[180px] h-[180px]"
          >
            <Card className="card-shimmer cursor-pointer group overflow-hidden w-full h-full">
              <CardContent className="flex flex-col items-center justify-center h-full p-5 relative">
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                {/* Floating sparkle */}
                <motion.div
                  className="absolute top-3 right-3"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                >
                  <Sparkles className="w-4 h-4 text-gold/40" />
                </motion.div>
                
                {/* Icon Image */}
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 3 + index * 0.3, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="relative z-10 flex-1 flex items-center justify-center"
                >
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                  />
                </motion.div>
                
                {/* Title Only */}
                <p className="text-gold font-semibold text-base text-center relative z-10">
                  {card.title}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Decorative footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Sparkles className="w-3 h-3 text-gold/50" />
          <p className="text-xs italic">
            Tap any card to explore
          </p>
          <Sparkles className="w-3 h-3 text-gold/50" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileRegulationsLayout;
