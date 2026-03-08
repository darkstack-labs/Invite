import { ReactNode, useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import BottomNavigation from './BottomNavigation';
import SwipeHint from './SwipeHint';
import type { Transition } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  particleCount?: number;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99
  },
};

const pageTransition: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 24,
};

const PageLayout = ({ children, showNav = true, particleCount = 50 }: PageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    if (
      info.offset.x > 120 &&
      info.velocity.x > 250 &&
      location.pathname !== '/home'
    ) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center relative overflow-x-hidden">

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60 z-0" />

      {/* Particles */}
      <ParticleBackground count={particleCount} />

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          className={`relative z-10 ${showNav ? 'pb-24' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{ touchAction: 'pan-y' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Swipe hint */}
      {showNav && location.pathname !== '/home' && <SwipeHint />}

      {/* Bottom Navigation */}
      {showNav && <BottomNavigation />}

    </div>
  );
};

export default PageLayout;