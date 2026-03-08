import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  Ban, 
  Clock, 
  Shirt, 
  DollarSign, 
  Package, 
  AlertTriangle,
  PartyPopper,
  Check,
  Pen
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PremiumHeading from '@/components/PremiumHeading';

interface MobileRulesLayoutProps {
  rules: string[];
  formatRule: (rule: string) => React.ReactNode;
}

const ruleIcons = [
  Ban,
  AlertTriangle,
  Ban,
  AlertTriangle,
  Ban,
  Clock,
  Shirt,
  Clock,
  Package,
  DollarSign,
  Clock,
  DollarSign,
];

const MobileRulesLayout = ({ rules, formatRule }: MobileRulesLayoutProps) => {
  const [checkedRules, setCheckedRules] = useState<boolean[]>(new Array(rules.length).fill(false));
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signed, setSigned] = useState(false);

  const allChecked = checkedRules.every(Boolean);

  const handleCheckRule = (index: number) => {
    const newChecked = [...checkedRules];
    newChecked[index] = !newChecked[index];
    setCheckedRules(newChecked);
  };

  const handleSign = () => {
    setSigned(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-[4vw] py-4 pb-24"
    >
      <PremiumHeading 
        title="Party Rules" 
        variant="mobile"
      />

      {/* Progress indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-4"
      >
        <div className="flex items-center justify-between text-xs text-gold/70 mb-2">
          <span>Acknowledged</span>
          <span>{checkedRules.filter(Boolean).length}/{rules.length}</span>
        </div>
        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-gold/30">
          <motion.div 
            className="h-full bg-gradient-to-r from-gold to-copper"
            initial={{ width: 0 }}
            animate={{ width: `${(checkedRules.filter(Boolean).length / rules.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-shimmer rounded-xl w-full relative overflow-hidden"
        style={{ padding: 'clamp(0.75rem, 3vw, 1rem)' }}
      >
        <motion.div
          className="absolute top-2 right-2"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-3 h-3 text-gold/40 fill-gold/20" />
        </motion.div>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vh, 0.75rem)' }}>
          {rules.map((rule, index) => {
            const Icon = ruleIcons[index] || ChevronRight;
            const isExpanded = expandedRule === index;
            
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`relative rounded-lg transition-all duration-300 ${
                  checkedRules[index] 
                    ? 'bg-gold/10 border border-gold/30' 
                    : 'bg-black/20 border border-transparent'
                }`}
                style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)' }}
              >
                <div 
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedRule(isExpanded ? null : index)}
                >
                  <motion.div
                    animate={checkedRules[index] ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <Icon 
                      className={`w-4 h-4 ${checkedRules[index] ? 'text-gold' : 'text-copper'}`}
                    />
                  </motion.div>
                  
                  <span 
                    className={`leading-relaxed flex-1 ${checkedRules[index] ? 'text-gold' : 'text-gold/80'}`}
                    style={{ fontSize: 'clamp(0.75rem, 3.2vw, 0.875rem)' }}
                  >
                    {formatRule(rule)}
                  </span>

                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={checkedRules[index]}
                      onCheckedChange={() => handleCheckRule(index)}
                      className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-gold/20 text-xs text-gold/60">
                        Tap the checkbox to acknowledge this rule. All rules must be acknowledged before entering.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Checkmark overlay */}
                <AnimatePresence>
                  {checkedRules[index] && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -right-1 -top-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-black" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      {/* Signature Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full mt-6"
      >
        <motion.div
          className={`card-shimmer rounded-xl p-4 transition-all duration-500 ${
            allChecked ? 'border-2 border-gold' : 'opacity-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Pen className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-display">Digital Signature</span>
          </div>

          {!signed ? (
            <motion.button
              disabled={!allChecked}
              onClick={handleSign}
              whileHover={allChecked ? { scale: 1.02 } : {}}
              whileTap={allChecked ? { scale: 0.98 } : {}}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                allChecked 
                  ? 'btn-gold cursor-pointer' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {allChecked ? 'Sign & Agree to Rules' : `Acknowledge all ${rules.length - checkedRules.filter(Boolean).length} remaining rules`}
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                <PartyPopper className="w-10 h-10 text-gold mx-auto mb-2" />
              </motion.div>
              <p className="text-gold font-display text-lg">Rules Acknowledged!</p>
              <p className="text-gold/60 text-xs mt-1">Thank you for your commitment</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4"
      >
        <motion.div
          animate={{ 
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="card-shimmer px-4 py-2"
        >
          <p className="text-gold/70 text-center italic" style={{ fontSize: 'clamp(0.625rem, 3vw, 0.75rem)' }}>
            Please follow all guidelines ✨
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileRulesLayout;
