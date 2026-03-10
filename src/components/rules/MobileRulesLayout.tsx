import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Star,
  Ban,
  Clock,
  Shirt,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";

import PremiumHeading from "@/components/PremiumHeading";

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
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-[calc(100dvh-5rem)] px-[4vw] py-4 pb-24"
    >
      <PremiumHeading title="Party Rules" variant="mobile" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-shimmer rounded-xl w-full relative overflow-hidden"
        style={{ padding: "clamp(0.75rem, 3vw, 1rem)" }}
      >
        <motion.div
          className="absolute top-2 right-2"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-3 h-3 text-gold/40 fill-gold/20" />
        </motion.div>

        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.5rem, 2vh, 0.75rem)",
          }}
        >
          {rules.map((rule, index) => {
            const Icon = ruleIcons[index] || ChevronRight;
            const isExpanded = expandedRule === index;

            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="relative rounded-lg bg-black/20 border border-transparent"
                style={{ padding: "clamp(0.5rem, 2vw, 0.75rem)" }}
              >
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedRule(isExpanded ? null : index)}
                >
                  <Icon className="w-4 h-4 text-copper mt-0.5" />

                  <span
                    className="leading-relaxed flex-1 text-gold/80"
                    style={{ fontSize: "clamp(0.75rem, 3.2vw, 0.875rem)" }}
                  >
                    {formatRule(rule)}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="card-shimmer px-4 py-2"
        >
          <p
            className="text-gold/70 text-center italic"
            style={{ fontSize: "clamp(0.625rem, 3vw, 0.75rem)" }}
          >
            Please follow all guidelines ✨
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MobileRulesLayout;