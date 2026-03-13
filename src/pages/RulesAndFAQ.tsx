import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import PremiumHeading from "@/components/PremiumHeading";
import { useDeviceType } from "@/hooks/useDeviceType";
import {
  ChevronDown,
  HelpCircle,
  Star,
  Sparkles,
  Ban,
  Clock,
  Shirt,
  DollarSign,
  Package,
  AlertTriangle,
  Shield,
  MessageCircle,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "General",
    question: "What is THE WORST BATCH party?",
    answer:
      "It's the ultimate celebration for our batch! A night of fun, dance, memories, and pure chaos.",
  },
  {
    category: "General",
    question: "When and where is the party?",
    answer:
      "The party is on 24th March 2026, starting at 4:00 PM. The venue will be revealed soon.",
  },
  {
    category: "Entry",
    question: "How do I get my Entry ID?",
    answer:
      "Your Entry ID is provided when you check your name on the guest list.",
  },
  {
    category: "Entry",
    question: "Can I bring a plus one?",
    answer:
      "Unfortunately, plus ones are not allowed. This party is exclusively for batch members.",
  },
  {
    category: "Dress Code",
    question: "What's the dress code?",
    answer:
      "Premium formal — black, gold, and elegant.",
  },
  {
    category: "Payment",
    question: "How do I make the payment?",
    answer:
      "Payment can be made via QR or cash before the deadline.",
  },
];

const rules = [
  "No inappropriate behaviour allowed.",
  "No requesting alcohol or substances.",
  "Any form of violent behaviour is strictly restricted.",
  "Shouting loudly is not allowed except while singing & dancing.",
  "Do not order food or drinks directly — inform organisers.",
  "Failure to follow dress code may result in denied entry.",
  "All guests must exit the venue by 9:00 PM.",
  "Everyone is responsible for their own belongings.",
  "No refunds under any circumstances.",
];

const ruleIcons = [
  Ban,
  AlertTriangle,
  Ban,
  AlertTriangle,
  Ban,
  Shirt,
  Clock,
  Package,
  DollarSign,
];

const RulesAndFAQ = () => {
  const deviceType = useDeviceType();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(
    () => [...new Set(faqItems.map((item) => item.category))],
    []
  );

  const getVariant = () => {
    if (deviceType === "mobile") return "mobile";
    if (deviceType === "tablet") return "tablet";
    return "desktop";
  };

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100dvh-5rem)] px-4 md:px-8 lg:px-12 py-6 pb-24"
      >
        <PremiumHeading
          title="Rules & FAQ"
          subtitle="Everything you need to know"
          variant={getVariant()}
        />

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/50 border border-gold/30">
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rules
              </TabsTrigger>

              <TabsTrigger value="faq" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-shimmer rounded-xl p-4 md:p-6"
              >
                <ul className="space-y-3">
                  {rules.map((rule, index) => {
                    const Icon = ruleIcons[index] || Ban;

                    return (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-black/20 rounded-lg p-3 md:p-4 flex items-start gap-3"
                      >
                        <Icon className="w-5 h-5 text-gold mt-1" />

                        <span className="text-gold/80 text-sm md:text-base">
                          {rule}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-8">
              {categories.map((category) => (
                <motion.div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-gold fill-gold/30" />
                    <h3 className="text-champagne font-display text-lg">
                      {category}
                    </h3>
                  </div>

                  {faqItems
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const globalIndex = faqItems.indexOf(item);
                      const isOpen = openIndex === globalIndex;

                      return (
                        <motion.div
                          key={globalIndex}
                          className="card-shimmer overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setOpenIndex(isOpen ? null : globalIndex)
                            }
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-5 h-5 text-gold" />
                              <span className="text-gold font-medium">
                                {item.question}
                              </span>
                            </div>

                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                              <ChevronDown className="w-5 h-5 text-gold/60" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="px-4 pb-4">
                                  <p className="text-champagne/80 text-sm">
                                    {item.answer}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <motion.div className="mt-12 text-center">
          <div className="card-shimmer inline-block px-6 py-3">
            <p className="text-gold/70 italic text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Still have questions? Contact the Organisers
              <Sparkles className="w-4 h-4" />
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default RulesAndFAQ;
