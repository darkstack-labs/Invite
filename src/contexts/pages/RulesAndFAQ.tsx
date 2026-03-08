import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import { useDeviceType } from '@/hooks/useDeviceType';
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
  PartyPopper,
  Check,
  Pen,
  Shield,
  MessageCircle
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "General",
    question: "What is THE WORST BATCH party?",
    answer: "It's the ultimate celebration for our batch! A night of fun, dance, memories, and pure chaos. Think of it as our grand farewell party with style."
  },
  {
    category: "General",
    question: "When and where is the party?",
    answer: "The party is on 24th March 2026, starting at 4:00 PM. The exact venue will be revealed closer to the date - it's a surprise!"
  },
  {
    category: "Entry",
    question: "How do I get my Entry ID?",
    answer: "Your Entry ID is provided when you check your name on the guest list. Use this ID to log in and access all party features."
  },
  {
    category: "Entry",
    question: "Can I bring a plus one?",
    answer: "Unfortunately, plus ones are not allowed. This party is exclusively for batch members on the guest list — no exceptions. Let's keep it intimate and special!"
  },
  {
    category: "Dress Code",
    question: "What's the dress code?",
    answer: "Premium formal! Think black, gold, and elegant. Check the Dress Code page for detailed guidelines, color palettes, and inspiration."
  },
  {
    category: "Dress Code",
    question: "What happens if I don't follow dress code?",
    answer: "Entry may be denied if the dress code isn't followed. We want everyone looking their best!"
  },
  {
    category: "Payment",
    question: "What's the contribution amount?",
    answer: "The contribution details are available in the Rules section. Payment must be made by the deadline to secure your spot."
  },
  {
    category: "Payment",
    question: "How do I make the payment?",
    answer: "You can pay via QR code (by 15th Feb) or cash (by 13th Jan). Check the Rules tab for complete payment details."
  },
  {
    category: "Party",
    question: "Will there be food and drinks?",
    answer: "Yes! A curated menu is being prepared. Check the Menu page for categories. Full menu will be revealed soon!"
  },
  {
    category: "Party",
    question: "What activities are planned?",
    answer: "Expect music, dancing, games, photo booths, and some surprises! The Activities page has more details."
  },
];

const rules = [
  'No inappropriate behaviour allowed.',
  'No requesting alcohol or substances. Any such activity will result in being kicked out of the venue.',
  'Any form of violent behaviour is strictly restricted.',
  'Shouting loudly is not allowed except while singing & dancing — even then, within sensible limits.',
  'Any orders for food and drinks are strictly restricted.',
  'In case food/drinks are needed, do not order directly. Inform the **Organisers**.',
  'Failure to follow the dress code may result in denied entry.',
  'All guests must exit the venue by **9:00 PM**.',
  'Everyone is responsible for their own belongings.',
  'Submit the contribution via QR by **15th Feb**, or by **13th Jan** for cash.',
  'If not attending, inform by **15th Feb** — or payment is still required. No exceptions.',
  '**No refunds** under any circumstances.',
];

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

const RULES_STORAGE_KEY = 'party_rules_acknowledged';

const RulesAndFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [checkedRules, setCheckedRules] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : new Array(rules.length).fill(false);
  });
  const [signed, setSigned] = useState(() => {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.every(Boolean);
    }
    return false;
  });
  const deviceType = useDeviceType();

  const getVariant = () => {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
  };

  const allChecked = checkedRules.every(Boolean);
  const categories = [...new Set(faqItems.map(item => item.category))];

  useEffect(() => {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(checkedRules));
    if (allChecked) {
      setSigned(true);
    }
  }, [checkedRules, allChecked]);

  const handleCheckRule = (index: number) => {
    if (signed) return; // Once signed, no changes allowed
    const newChecked = [...checkedRules];
    newChecked[index] = !newChecked[index];
    setCheckedRules(newChecked);
  };

  const handleSign = () => {
    setSigned(true);
    const allTrue = new Array(rules.length).fill(true);
    setCheckedRules(allTrue);
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(allTrue));
  };

  const formatRule = (rule: string) => {
    return rule.split('**').map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="text-gold">{part}</strong> : part
    );
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
              <TabsTrigger 
                value="rules" 
                className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Rules</span>
                {signed && <Check className="w-3 h-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>FAQ</span>
              </TabsTrigger>
            </TabsList>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              {/* Progress indicator */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
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

              {/* Rules List */}
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
                        transition={{ delay: 0.05 * index }}
                        className={`relative rounded-lg p-3 md:p-4 transition-all duration-300 ${
                          checkedRules[index] 
                            ? 'bg-gold/10 border border-gold/30' 
                            : 'bg-black/20 border border-transparent hover:border-gold/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            animate={checkedRules[index] ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ duration: 0.5 }}
                            className="flex-shrink-0 mt-0.5"
                          >
                            <Icon 
                              className={`w-4 h-4 md:w-5 md:h-5 ${checkedRules[index] ? 'text-gold' : 'text-copper'}`}
                            />
                          </motion.div>
                          
                          <span 
                            className={`leading-relaxed flex-1 text-sm md:text-base ${checkedRules[index] ? 'text-gold' : 'text-gold/80'}`}
                          >
                            {formatRule(rule)}
                          </span>

                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              checked={checkedRules[index]}
                              onCheckedChange={() => handleCheckRule(index)}
                              disabled={signed}
                              className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                            />
                          </div>
                        </div>
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
                className="w-full"
              >
                <motion.div
                  className={`card-shimmer rounded-xl p-4 md:p-6 transition-all duration-500 ${
                    allChecked || signed ? 'border-2 border-gold' : 'opacity-70'
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
                        <PartyPopper className="w-12 h-12 text-gold mx-auto mb-2" />
                      </motion.div>
                      <p className="text-gold font-display text-lg">Rules Acknowledged!</p>
                      <p className="text-gold/60 text-sm mt-1">Thank you for your commitment</p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-8">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-gold fill-gold/30" />
                    <h3 className="text-champagne font-display text-lg">{category}</h3>
                  </div>

                  {faqItems
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const globalIndex = faqItems.indexOf(item);
                      const isOpen = openIndex === globalIndex;

                      return (
                        <motion.div
                          key={globalIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="card-shimmer overflow-hidden"
                        >
                          <motion.button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full flex items-center justify-between p-4 text-left"
                            whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-5 h-5 text-gold flex-shrink-0" />
                              <span className="text-gold font-medium text-sm md:text-base">{item.question}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gold/60" />
                            </motion.div>
                          </motion.button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="pl-8 border-l-2 border-gold/30">
                                    <p className="text-champagne/80 text-sm leading-relaxed">
                                      {item.answer}
                                    </p>
                                  </div>
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="card-shimmer inline-block px-6 py-3"
          >
            <p className="text-gold/70 italic text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Still have questions? Contact the Organisers
              <Sparkles className="w-4 h-4" />
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default RulesAndFAQ;
