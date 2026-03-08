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
  { title: 'Party Details', image: eventIcon, route: '/event-details', delay: 0.1 },
  { title: 'Dress Code', image: dresscodeIcon, route: '/dress-code', delay: 0.2 },
  { title: 'Menu', image: menuIcon, route: '/menu', delay: 0.3 },
  { title: 'RSVP', image: rsvpIcon, route: '/rsvp', delay: 0.4 },
];

const TabletRegulationsLayout = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-[calc(100dvh-5rem)] px-8 py-8"
    >
      {/* Premium Heading */}
      <div className="mb-8">
        <PremiumHeading 
          title="Activities" 
          subtitle="Discover the royal experience awaiting you"
          variant="tablet"
        />
      </div>

      {/* 2x2 Grid Square Cards */}
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto w-full flex-1">
        {activityCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: card.delay,
              duration: 0.5,
              type: 'spring',
              stiffness: 150
            }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.route)}
          >
            <Card className="card-shimmer cursor-pointer group overflow-hidden aspect-square">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full relative">
                {/* Premium glow overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gold/10 to-champagne/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* Floating particles effect */}
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [0, -10, 0]
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
                    duration: 4 + index * 0.5, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="relative z-10 flex-1 flex items-center justify-center"
                >
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  />
                </motion.div>
                
                <p className="text-gold text-sm text-center font-medium relative z-10 mt-3">
                  {card.title}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Decorative bottom element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-8"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(212, 175, 55, 0.2)',
              '0 0 40px rgba(212, 175, 55, 0.4)',
              '0 0 20px rgba(212, 175, 55, 0.2)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="card-shimmer px-8 py-4"
        >
          <p className="text-gold/70 text-center italic">
            Tap any card to explore details
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TabletRegulationsLayout;
