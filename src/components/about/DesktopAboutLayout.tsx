import { motion } from 'framer-motion';
import { Instagram, Heart } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import OrganizerCard from './OrganizerCard';
import type { Organizer } from '@/pages/About';

interface DesktopAboutLayoutProps {
  organizers: Organizer[];
  onSelectOrganizer: (org: Organizer) => void;
}

const DesktopAboutLayout = ({ organizers, onSelectOrganizer }: DesktopAboutLayoutProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[calc(100dvh-5rem)] px-12 py-4"
    >
      <div className="max-w-5xl w-full">
        {/* Premium Heading */}
        <div className="mb-12">
          <PremiumHeading 
            title="About Us" 
            variant="desktop"
          />
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - First 3 Organizers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {organizers.slice(0, 3).map((org, index) => (
              <OrganizerCard
                key={org.name}
                organizer={org}
                index={index}
                onClick={() => onSelectOrganizer(org)}
                size="large"
              />
            ))}
          </motion.div>

          {/* Center Column - Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col justify-center"
          >
            <motion.div 
              className="card-shimmer p-8 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Floating hearts */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-champagne/50 fill-champagne/30" />
              </motion.div>
              <motion.div
                className="absolute bottom-4 left-4"
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Heart className="w-5 h-5 text-champagne/50 fill-champagne/30" />
              </motion.div>

              <h3 className="text-2xl font-display text-gold mb-6 text-center">Contact Us</h3>
              <a
                href="https://www.instagram.com/theworstbatchsigningoff?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-4 text-gold hover:text-champagne transition-colors group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  animate={{ 
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Instagram className="w-12 h-12" />
                </motion.div>
                <span className="text-lg italic font-medium text-center group-hover:underline">@theworstbatchsigningoff</span>
              </a>
              <p className="text-muted-foreground text-center mt-6 text-sm">
                Follow us for updates and behind-the-scenes content
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Last 3 Organizers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {organizers.slice(3, 6).map((org, index) => (
              <OrganizerCard
                key={org.name}
                organizer={org}
                index={index + 3}
                onClick={() => onSelectOrganizer(org)}
                size="large"
              />
            ))}
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <motion.div
            animate={{ 
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                '0 0 20px rgba(212, 175, 55, 0.1)',
                '0 0 40px rgba(212, 175, 55, 0.2)',
                '0 0 20px rgba(212, 175, 55, 0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="card-shimmer px-8 py-4 mx-auto w-fit"
          >
            <p className="text-center text-muted-foreground text-lg italic">
              "Together, we make the magic happen"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DesktopAboutLayout;
