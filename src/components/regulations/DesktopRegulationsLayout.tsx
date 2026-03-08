import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
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

const DesktopRegulationsLayout = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-[calc(100dvh-5rem)] px-12 py-10"
    >
      {/* Premium Heading */}
      <div className="mb-12">
        <PremiumHeading 
          title="Activities" 
          subtitle="Immerse yourself in the royal experience"
          variant="desktop"
        />
      </div>

      {/* 4-Column Grid Square Cards */}
      <div className="grid grid-cols-4 gap-8 max-w-5xl mx-auto w-full flex-1">
        {activityCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: card.delay + 0.3,
              duration: 0.6,
              type: 'spring',
              stiffness: 120
            }}
            whileHover={{ scale: 1.08, y: -12 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.route)}
          >
            <Card className="card-shimmer cursor-pointer group overflow-hidden aspect-square relative">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full relative">
                {/* Premium gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-champagne/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
                
                {/* Corner decorations */}
                <motion.div
                  className="absolute top-3 left-3"
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                >
                  <Star className="w-4 h-4 text-muted-foreground/50 fill-muted-foreground/20" />
                </motion.div>
                <motion.div
                  className="absolute bottom-3 right-3"
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 + 1.5 }}
                >
                  <Star className="w-4 h-4 text-muted-foreground/50 fill-muted-foreground/20" />
                </motion.div>
                
                {/* Floating sparkle */}
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [0, -15, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.7 }}
                >
                  <Sparkles className="w-5 h-5 text-muted-foreground/60" />
                </motion.div>
                
                {/* Icon Image */}
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 5 + index * 0.5, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="relative z-10 flex-1 flex items-center justify-center"
                >
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all duration-500"
                  />
                </motion.div>
                
                <p className="text-gold text-base text-center font-medium relative z-10 mt-4">
                  {card.title}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Grand decorative footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-12"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(212, 175, 55, 0.2)',
              '0 0 60px rgba(212, 175, 55, 0.4)',
              '0 0 30px rgba(212, 175, 55, 0.2)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="card-shimmer px-12 py-5"
        >
          <motion.p 
            className="text-gold/70 text-center italic text-lg"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Click any card to unveil the details
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DesktopRegulationsLayout;
