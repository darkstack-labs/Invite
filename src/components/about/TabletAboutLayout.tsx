import { motion } from 'framer-motion';
import { Instagram, Heart } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import OrganizerCard from './OrganizerCard';
import type { Organizer } from '@/pages/About';

interface TabletAboutLayoutProps {
  organizers: Organizer[];
  onSelectOrganizer: (org: Organizer) => void;
}

const TabletAboutLayout = ({ organizers, onSelectOrganizer }: TabletAboutLayoutProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-8 py-4"
    >
      <div className="max-w-2xl w-full">
        {/* Premium Heading */}
        <div className="mb-8">
          <PremiumHeading 
            title="About Us" 
            variant="tablet"
          />
        </div>

        {/* Organizer Grid - 2 columns with Flip Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          {organizers.map((org, index) => (
            <OrganizerCard
              key={org.name}
              organizer={org}
              index={index}
              onClick={() => onSelectOrganizer(org)}
              size="medium"
            />
          ))}
        </motion.div>

        {/* Contact Us Box */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="mt-10 w-full"
        >
          <motion.div 
            className="card-shimmer p-6 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Floating hearts */}
            <motion.div
              className="absolute top-3 right-3"
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-champagne/50 fill-champagne/30" />
            </motion.div>
            <motion.div
              className="absolute bottom-3 left-3"
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <Heart className="w-4 h-4 text-champagne/50 fill-champagne/30" />
            </motion.div>

            <h3 className="text-xl font-display text-gold mb-4 text-center">Contact Us</h3>
            <a
              href="https://www.instagram.com/theworstbatchsigningoff?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-gold hover:text-champagne transition-colors group"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                animate={{ 
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Instagram className="w-7 h-7" />
              </motion.div>
              <span className="text-lg italic font-medium group-hover:underline">theworstbatchsigningoff</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TabletAboutLayout;
