import { useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileAboutLayout from '@/components/about/MobileAboutLayout';
import TabletAboutLayout from '@/components/about/TabletAboutLayout';
import DesktopAboutLayout from '@/components/about/DesktopAboutLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Instagram, Sparkles, Star, Crown, Palette, Code, MapPin, Users, Megaphone } from 'lucide-react';

export interface Organizer {
  name: string;
  role: string;
  funFact: string;
  instagram?: string;
  avatar: string;
  iconComponent?: React.ReactNode;
}

export const organizers: Organizer[] = [
  { 
    name: 'Pahal', 
    role: 'Lead Organizer & Party Planner',
    funFact: 'Takes credit for everyone else\'s work and calls it "leadership"',
    instagram: 'https://www.instagram.com/pahaldoesnotthink',
    avatar: 'crown',
  },
  { 
    name: 'Aditi', 
    role: 'Design & Coordination Lead',
    funFact: 'Will redesign your life choices if you let her',
    instagram: 'https://www.instagram.com/4d1t10_',
    avatar: 'palette',
  },
  { 
    name: 'Sarvagya', 
    role: 'Tech Head & Execution Manager',
    funFact: 'Runs on coffee, bugs, and zero sleep — in that order',
    instagram: 'https://www.instagram.com/sarvagya.kaushik_17',
    avatar: 'code',
  },
  { 
    name: 'Shivasheesh', 
    role: 'Venue Setup & Operations',
    funFact: 'Shows up late but somehow finishes first — suspicious',
    instagram: 'https://www.instagram.com/yk_dafoe',
    avatar: 'mappin',
  },
  { 
    name: 'Anay', 
    role: 'Logistics & Guest Management',
    funFact: 'Knows everyone by name and face',
    instagram: 'https://www.instagram.com/ohmycorpse',
    avatar: 'users',
  },
  { 
    name: 'Shray', 
    role: 'Communication & Feedback',
    funFact: 'The human megaphone of the group',
    instagram: 'https://www.instagram.com/icchhadharii',
    avatar: 'megaphone',
  },
];

const avatarIconMap: Record<Organizer["avatar"], React.ReactNode> = {
  crown: <Crown className="w-full h-full p-1 text-gold" />,
  palette: <Palette className="w-full h-full p-1 text-gold" />,
  code: <Code className="w-full h-full p-1 text-gold" />,
  mappin: <MapPin className="w-full h-full p-1 text-gold" />,
  users: <Users className="w-full h-full p-1 text-gold" />,
  megaphone: <Megaphone className="w-full h-full p-1 text-gold" />,
};

const About = () => {
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const deviceType = useDeviceType();

  const renderLayout = () => {
    switch (deviceType) {
      case 'desktop':
        return <DesktopAboutLayout organizers={organizers} onSelectOrganizer={setSelectedOrganizer} />;
      case 'tablet':
        return <TabletAboutLayout organizers={organizers} onSelectOrganizer={setSelectedOrganizer} />;
      default:
        return <MobileAboutLayout organizers={organizers} onSelectOrganizer={setSelectedOrganizer} />;
    }
  };

  return (
    <PageLayout>
      {renderLayout()}

      {/* Enhanced Popup Dialog */}
      <Dialog open={!!selectedOrganizer} onOpenChange={() => setSelectedOrganizer(null)}>
        <DialogContent className="bg-gradient-to-br from-black via-black/95 to-gold/10 border-2 border-gold/50 text-gold max-w-sm overflow-hidden">
          {/* Floating decorations */}
          <motion.div
            className="absolute top-4 right-12"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-champagne/40" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-gold/40 fill-gold/20" />
          </motion.div>

          <DialogHeader>
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-copper/30 border-2 border-gold/50 flex items-center justify-center"
            >
              {selectedOrganizer?.avatar && avatarIconMap[selectedOrganizer.avatar] ? (
                <div className="w-10 h-10">{avatarIconMap[selectedOrganizer.avatar]}</div>
              ) : (
                <Crown className="w-10 h-10 text-gold" />
              )}
            </motion.div>
            
            <DialogTitle className="text-2xl font-display text-champagne text-center">
              {selectedOrganizer?.name}
            </DialogTitle>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Role */}
            <p className="text-center text-gold text-lg py-2 border-b border-gold/20">
              {selectedOrganizer?.role}
            </p>
            
            {/* Fun Fact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gold/10 rounded-lg p-4 border border-gold/20"
            >
              <p className="text-sm text-champagne/70 mb-1">Fun Fact</p>
              <p className="text-gold/90 font-medium">{selectedOrganizer?.funFact}</p>
            </motion.div>

            {/* Instagram Link */}
            {selectedOrganizer?.instagram && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                href={selectedOrganizer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gold/20 to-copper/20 rounded-lg border border-gold/30 hover:border-gold/50 transition-all group"
              >
                <Instagram className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                <span className="text-gold/80 group-hover:text-gold transition-colors">Instagram</span>
              </motion.a>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default About;
