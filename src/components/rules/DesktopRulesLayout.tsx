import { useState } from "react";
import { motion } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";

import PremiumHeading from "@/components/PremiumHeading";

interface DesktopRulesLayoutProps {
  rules: string[];
  formatRule: (rule: string) => React.ReactNode;
}

const behaviorIcons: LucideIcon[] = [Ban, AlertTriangle, Ban, AlertTriangle, Ban, Clock];
const logisticsIcons: LucideIcon[] = [Shirt, Clock, Package, DollarSign, Clock, DollarSign];

const DesktopRulesLayout = ({ rules, formatRule }: DesktopRulesLayoutProps) => {
  const behaviorRules = rules.slice(0, 6);
  const logisticsRules = rules.slice(6);

  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  const RuleCard = ({
    rule,
    index,
    globalIndex,
    Icon,
  }: {
    rule: string;
    index: number;
    globalIndex: number;
    Icon: LucideIcon;
  }) => {
    const isExpanded = expandedRule === globalIndex;

    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index }}
        whileHover={{ scale: 1.02, x: 4 }}
        className="relative rounded-xl p-4 transition-all duration-300 bg-black/30 border border-gold/20 hover:border-gold/40 cursor-pointer"
        onClick={() => setExpandedRule(isExpanded ? null : globalIndex)}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg flex-shrink-0 bg-copper/20">
            <Icon className="w-5 h-5 text-copper" />
          </div>

          <span className="text-base leading-relaxed flex-1 text-gold/80">
            {formatRule(rule)}
          </span>
        </div>
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
          <PremiumHeading title="Party Rules & Guidelines" variant="desktop" />
        </div>

        <div className="grid grid-cols-2 gap-8">
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
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-gold/40 fill-gold/20" />
            </motion.div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-copper/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-copper" />
              </div>
              <h2 className="text-xl font-display text-gold">
                Behavior Guidelines
              </h2>
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
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <Star className="w-5 h-5 text-gold/40 fill-gold/20" />
            </motion.div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-copper/20 rounded-lg">
                <Clock className="w-6 h-6 text-copper" />
              </div>
              <h2 className="text-xl font-display text-gold">
                Logistics & Payment
              </h2>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="card-shimmer px-8 py-4 mx-auto w-fit flex items-center gap-3"
          >
            <Banknote className="w-5 h-5 text-gold" />
            <p className="text-center italic text-muted-foreground">
              Please ensure all payments and confirmations are made before the
              deadline
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DesktopRulesLayout;
