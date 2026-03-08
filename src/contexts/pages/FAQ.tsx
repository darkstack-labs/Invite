import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import { ChevronDown, HelpCircle, Star, Sparkles } from 'lucide-react';
import { useDeviceType } from '@/hooks/useDeviceType';

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
    answer: "Currently, the party is exclusive to batch members on the guest list. If you'd like to bring someone, please contact the Organisers."
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
    answer: "You can pay via QR code (by 15th Feb) or cash (by 13th Jan). Check the Rules page for complete payment details."
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
  {
    category: "Rules",
    question: "What time does the party end?",
    answer: "All guests must exit by 9:00 PM. Plan your transportation accordingly!"
  },
  {
    category: "Rules",
    question: "Can I order food/drinks directly?",
    answer: "No. All orders must go through the Organisers. Direct ordering is strictly prohibited."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const deviceType = useDeviceType();

  const getVariant = () => {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
  };

  const categories = [...new Set(faqItems.map(item => item.category))];

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100dvh-5rem)] px-4 md:px-8 lg:px-12 py-6"
      >
        <PremiumHeading 
          title="FAQ" 
          subtitle="Got questions? We've got answers"
          variant={getVariant()}
        />

        <div className="max-w-3xl mx-auto space-y-8">
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
                          <span className="text-gold font-medium">{item.question}</span>
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

export default FAQ;
