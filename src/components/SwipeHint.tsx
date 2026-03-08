import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChevronRight } from 'lucide-react';

const HINT_STORAGE_KEY = 'swipeHintShown';

const SwipeHint = () => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Use sessionStorage for "once per session" (clears when browser closes)
    const hasSeenHint = sessionStorage.getItem(HINT_STORAGE_KEY);
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    sessionStorage.setItem(HINT_STORAGE_KEY, 'true');
  };

  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        dismissHint();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={dismissHint}
          className="fixed left-2 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
        >
          <div className="bg-black/75 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-gold/20 flex items-center gap-1">
            <Home className="w-3 h-3 text-gold" />
            <motion.div
              animate={{ x: [3, 0, 3] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center"
            >
              <ChevronRight className="w-2.5 h-2.5 text-gold/50" />
              <ChevronRight className="w-2.5 h-2.5 text-gold/70 -ml-1" />
              <ChevronRight className="w-2.5 h-2.5 text-gold -ml-1" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeHint;
