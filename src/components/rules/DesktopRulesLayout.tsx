import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  Banknote, 
  Star,
  Ban,
  Shirt,
  DollarSign,
  Package,
  PartyPopper,
  Check,
  Pen,
  Shield,
  Sparkles
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PremiumHeading from '@/components/PremiumHeading';

interface DesktopRulesLayoutProps {
  rules: string[];
  formatRule: (rule: string) => React.ReactNode;
}

const behaviorIcons = [Ban, AlertTriangle, Ban, AlertTriangle, Ban, Clock];
const logisticsIcons = [Shirt, Clock, Package, DollarSign, Clock, DollarSign];

const DesktopRulesLayout = ({ rules, formatRule }: DesktopRulesLayoutProps) => {
  const behaviorRules = rules.slice(0, 6);
  const logisticsRules = rules.slice(6);
  
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

  const RuleCard = ({ 
    rule, 
    index, 
    globalIndex,
    Icon 
  }: { 
    rule: string; 
    index: number; 
    globalIndex: number;
    Icon: any;
  }) => {
    const isExpanded = expandedRule === globalIndex;
    const isChecked = checkedRules[globalIndex];

    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index }}
        whileHover={{ scale: 1.02, x: 4 }}
        className={`relative rounded-xl p-4 transition-all duration-300 cursor-pointer ${
          isChecked 
            ? 'bg-gold/15 border-2 border-gold/50' 
            : 'bg-black/30 border border-gold/20 hover:border-gold/40'
        }`}
        onClick={() => setExpandedRule(isExpanded ? null : globalIndex)}
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={isChecked ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            } : { 
              y: [0, -3, 0]
            }}
            transition={{ duration: isChecked ? 0.5 : 3, repeat: isChecked ? 0 : Infinity, delay: index * 0.1 }}
            className={`p-2 rounded-lg flex-shrink-0 ${isChecked ? 'bg-gold/25' : 'bg-copper/20'}`}
          >
            <Icon className={`w-5 h-5 ${isChecked ? 'text-gold' : 'text-copper'}`} />
          </motion.div>
          
          <span className={`text-base leading-relaxed flex-1 ${isChecked ? 'text-gold' : 'text-gold/80'}`}>
            {formatRule(rule)}
          </span>

          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <Checkbox 
              checked={isChecked}
              onCheckedChange={() => handleCheckRule(globalIndex)}
              className="w-6 h-6 border-2 border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold transition-all"
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
                <p>Click the checkbox to acknowledge this rule.</p>
                <p className="mt-1">All rules must be acknowledged to gain entry.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check badge */}
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -right-2 -top-2 w-7 h-7 bg-gradient-to-br from-gold to-copper rounded-full flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.li>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-12 py-4 pb-24"
    >
      <div className="max-w-6xl w-full">
        <div className="mb-8">
          <PremiumHeading 
            title="Party Rules & Guidelines" 
            variant="desktop"
          />
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between text-sm text-gold/70 mb-3">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-display text-lg">Rules Acknowledgment Progress</span>
            </span>
            <span className="font-display text-xl">{checkedRules.filter(Boolean).length}/{rules.length}</span>
          </div>
          <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-gold/30">
            <motion.div 
              className="h-full bg-gradient-to-r from-gold via-copper to-gold relative"
              initial={{ width: 0 }}
              animate={{ width: `${(checkedRules.filter(Boolean).length / rules.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-8">
          {/* Behavior Rules */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-shimmer rounded-2xl p-6 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-gold/40 fill-gold/20" />
            </motion.div>

            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 bg-copper/20 rounded-lg"
              >
                <AlertTriangle className="w-6 h-6 text-copper" />
              </motion.div>
              <h2 className="text-xl font-display text-gold">Behavior Guidelines</h2>
            </div>
            
            <ul className="space-y-3">
              {behaviorRules.map((rule, index) => (
                <RuleCard 
                  key={index}
                  rule={rule}
                  index={index}
                  globalIndex={index}
                  Icon={behaviorIcons[index] || ChevronRight}
                />
              ))}
            </ul>
          </motion.div>

          {/* Logistics Rules */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-shimmer rounded-2xl p-6 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-gold/40 fill-gold/20" />
            </motion.div>

            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.15, rotate: -5 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="p-2 bg-copper/20 rounded-lg"
              >
                <Clock className="w-6 h-6 text-copper" />
              </motion.div>
              <h2 className="text-xl font-display text-gold">Logistics & Payment</h2>
            </div>
            
            <ul className="space-y-3">
              {logisticsRules.map((rule, index) => (
                <RuleCard 
                  key={index + 6}
                  rule={rule}
                  index={index}
                  globalIndex={index + 6}
                  Icon={logisticsIcons[index] || ChevronRight}
                />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Signature Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <motion.div
            className={`card-shimmer rounded-2xl p-8 transition-all duration-500 ${
              allChecked ? 'border-2 border-gold' : 'opacity-60'
            }`}
            style={allChecked ? { boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' } : {}}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={allChecked ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, repeat: allChecked ? Infinity : 0, repeatDelay: 2 }}
                  className="p-2 bg-gold/20 rounded-lg"
                >
                  <Pen className="w-6 h-6 text-gold" />
                </motion.div>
                <span className="text-xl text-gold font-display">Digital Signature & Agreement</span>
              </div>
              
              {allChecked && !signed && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2 text-gold"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">Ready to sign!</span>
                </motion.div>
              )}
            </div>

            {!signed ? (
              <motion.button
                disabled={!allChecked}
                onClick={handleSign}
                whileHover={allChecked ? { scale: 1.02 } : {}}
                whileTap={allChecked ? { scale: 0.98 } : {}}
                className={`w-full py-5 rounded-xl font-semibold text-lg transition-all ${
                  allChecked 
                    ? 'btn-gold cursor-pointer' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {allChecked 
                  ? '✍️ Sign & Agree to All Party Rules' 
                  : `Please acknowledge ${rules.length - checkedRules.filter(Boolean).length} more rules to proceed`
                }
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <PartyPopper className="w-16 h-16 text-gold mx-auto mb-4" />
                </motion.div>
                <p className="text-gold font-display text-3xl">All Rules Acknowledged!</p>
                <p className="text-gold/60 text-base mt-2">Thank you for your commitment to making this an amazing celebration</p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full"
                >
                  <Check className="w-5 h-5 text-gold" />
                  <span className="text-gold text-sm">Signature recorded</span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
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
            className="card-shimmer px-8 py-4 mx-auto w-fit flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Banknote className="w-5 h-5 text-gold" />
            </motion.div>
            <p className="text-center italic text-muted-foreground">
              Please ensure all payments and confirmations are made before the deadline
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DesktopRulesLayout;
