import { motion } from 'framer-motion';
import { Instagram, Heart } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import OrganizerCard from './OrganizerCard';
import type { Organizer } from '@/pages/About';

interface MobileAboutLayoutProps {
  organizers: Organizer[];
  onSelectOrganizer: (org: Organizer) => void;
}

const MobileAboutLayout = ({ organizers, onSelectOrganizer }: MobileAboutLayoutProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-[4vw] py-4"
    >
      {/* Premium Heading */}
      <div className="mb-4">
        <PremiumHeading 
          title="About Us" 
          variant="mobile"
        />
      </div>

      {/* Organizer List with Flip Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col w-full max-w-[90vw]"
        style={{ gap: 'clamp(0.5rem, 2vh, 1rem)' }}
      >
        {organizers.map((org, index) => (
          <OrganizerCard
            key={org.name}
            organizer={org}
            index={index}
            onClick={() => onSelectOrganizer(org)}
            size="small"
          />
        ))}
      </motion.div>

      {/* Contact Us Box */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="mt-[3vh] w-full max-w-[90vw]"
      >
        <motion.div 
          className="card-shimmer relative overflow-hidden"
          style={{ padding: 'clamp(0.75rem, 3vh, 1.5rem)' }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Floating hearts */}
          <motion.div
            className="absolute top-2 right-2"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-champagne/50 fill-champagne/30" />
          </motion.div>

          <h3 
            className="font-display text-gold text-center"
            style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', marginBottom: 'clamp(0.75rem, 2vh, 1rem)' }}
          >
            Contact Us
          </h3>
          <a
            href="https://www.instagram.com/theworstbatchsigningoff?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-gold hover:text-champagne transition-colors group"
            style={{ gap: 'clamp(0.5rem, 2vw, 0.75rem)' }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              animate={{ 
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Instagram style={{ width: 'clamp(1.25rem, 5vw, 1.75rem)', height: 'clamp(1.25rem, 5vw, 1.75rem)' }} />
            </motion.div>
            <span 
              className="italic font-medium group-hover:underline"
              style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1rem)' }}
            >
              theworstbatchsigningoff
            </span>
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileAboutLayout;
