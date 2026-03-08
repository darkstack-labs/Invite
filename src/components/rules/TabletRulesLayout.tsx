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
  Pen,
  Shield
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PremiumHeading from '@/components/PremiumHeading';

interface TabletRulesLayoutProps {
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

const TabletRulesLayout = ({ rules, formatRule }: TabletRulesLayoutProps) => {
  const [checkedRules, setCheckedRules] = useState<boolean[]>(new Array(rules.length).fill(false));
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
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
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-8 py-4 pb-24"
    >
      <div className="mb-6">
        <PremiumHeading 
          title="Party Rules & Guidelines" 
          variant="tablet"
        />
      </div>

      {/* Progress indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mb-6"
      >
        <div className="flex items-center justify-between text-sm text-gold/70 mb-2">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Rules Acknowledged
          </span>
          <span className="font-display">{checkedRules.filter(Boolean).length}/{rules.length}</span>
        </div>
        <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-gold/30">
          <motion.div 
            className="h-full bg-gradient-to-r from-gold via-copper to-gold"
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
        className="card-shimmer rounded-xl p-6 max-w-2xl w-full relative overflow-hidden"
      >
        {/* Corner stars */}
        <motion.div
          className="absolute top-3 right-3"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-5 h-5 text-gold/40 fill-gold/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-3 left-3"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-4 h-4 text-gold/40 fill-gold/20" />
        </motion.div>

        <ul className="space-y-3">
          {rules.map((rule, index) => {
            const Icon = ruleIcons[index] || ChevronRight;
            const isExpanded = expandedRule === index;
            
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                whileHover={{ scale: 1.01 }}
                className={`relative rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                  checkedRules[index] 
                    ? 'bg-gold/15 border-2 border-gold/40' 
                    : 'bg-black/30 border border-gold/20 hover:border-gold/40'
                }`}
                onClick={() => setExpandedRule(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={checkedRules[index] ? { 
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0]
                    } : { 
                      y: [0, -2, 0]
                    }}
                    transition={{ duration: checkedRules[index] ? 0.5 : 2, repeat: checkedRules[index] ? 0 : Infinity }}
                    className={`p-2 rounded-lg ${checkedRules[index] ? 'bg-gold/20' : 'bg-copper/20'}`}
                  >
                    <Icon 
                      className={`w-5 h-5 ${checkedRules[index] ? 'text-gold' : 'text-copper'}`}
                    />
                  </motion.div>
                  
                  <span className={`text-base leading-relaxed flex-1 ${checkedRules[index] ? 'text-gold' : 'text-gold/80'}`}>
                    {formatRule(rule)}
                  </span>

                  <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                    <Checkbox 
                      checked={checkedRules[index]}
                      onCheckedChange={() => handleCheckRule(index)}
                      className="w-6 h-6 border-2 border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
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
                      <div className="mt-4 pt-4 border-t border-gold/20 text-sm text-gold/60">
                        <p>Tap the checkbox on the right to acknowledge this rule.</p>
                        <p className="mt-2">All rules must be acknowledged to confirm your attendance.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Checkmark badge */}
                <AnimatePresence>
                  {checkedRules[index] && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-gradient-to-br from-gold to-copper rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-4 h-4 text-black" />
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
        className="w-full max-w-2xl mt-8"
      >
        <motion.div
          className={`card-shimmer rounded-xl p-6 transition-all duration-500 ${
            allChecked ? 'border-2 border-gold shadow-lg' : 'opacity-60'
          }`}
          style={allChecked ? { boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' } : {}}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={allChecked ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: allChecked ? Infinity : 0, repeatDelay: 2 }}
            >
              <Pen className="w-5 h-5 text-gold" />
            </motion.div>
            <span className="text-lg text-gold font-display">Digital Signature</span>
          </div>

          {!signed ? (
            <motion.button
              disabled={!allChecked}
              onClick={handleSign}
              whileHover={allChecked ? { scale: 1.02 } : {}}
              whileTap={allChecked ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                allChecked 
                  ? 'btn-gold cursor-pointer' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {allChecked 
                ? '✍️ Sign & Agree to All Rules' 
                : `Acknowledge ${rules.length - checkedRules.filter(Boolean).length} more rules to sign`
              }
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <PartyPopper className="w-14 h-14 text-gold mx-auto mb-3" />
              </motion.div>
              <p className="text-gold font-display text-2xl">Rules Acknowledged!</p>
              <p className="text-gold/60 text-sm mt-2">Thank you for your commitment to a great party</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6"
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
          className="card-shimmer px-6 py-3"
        >
          <p className="text-gold/70 text-center italic">
            Please follow all guidelines for a memorable evening ✨
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TabletRulesLayout;
