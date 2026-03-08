import { useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Sparkles, Star, GlassWater, Wine, Salad, Drumstick, ChefHat, CakeSlice } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '@/hooks/useDeviceType';

interface MenuItem {
  name: string;
  isChefSpecial?: boolean;
  type: 'veg' | 'nonveg' | 'beverage';
}

interface MenuSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const VegIcon = () => (
  <div className="w-4 h-4 border-[1.5px] border-green-500 rounded-sm flex items-center justify-center shrink-0">
    <div className="w-2 h-2 rounded-full bg-green-500" />
  </div>
);

const NonVegIcon = () => (
  <div className="w-4 h-4 border-[1.5px] border-red-500 rounded-sm flex items-center justify-center shrink-0">
    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[7px] border-l-transparent border-r-transparent border-b-red-500" />
  </div>
);

const sections: MenuSection[] = [
  {
    id: 'welcome',
    title: 'Welcome Drink',
    subtitle: 'To set the mood right',
    icon: <Wine className="w-5 h-5" />,
    items: [
      { name: 'Welcome Drink', type: 'beverage' },
    ],
  },
  {
    id: 'mocktails',
    title: 'Mocktail',
    subtitle: 'One per person — choose wisely',
    icon: <GlassWater className="w-5 h-5" />,
    items: [
      { name: 'Blue Lagoon', type: 'veg' },
      { name: 'The Red Hot Lipstick', type: 'veg', isChefSpecial: true },
      { name: 'Fruit Punch', type: 'veg', isChefSpecial: true },
      { name: 'Mojito', type: 'veg' },
    ],
  },
  {
    id: 'softdrinks',
    title: 'Soft Drinks',
    subtitle: 'Stay refreshed',
    icon: <Wine className="w-5 h-5" />,
    items: [
      { name: 'Soft Drinks', type: 'beverage' },
    ],
  },
  {
    id: 'vegstarters',
    title: 'Veg Starters',
    subtitle: 'Begin the feast',
    icon: <Salad className="w-5 h-5" />,
    items: [
      { name: 'French Fries', type: 'veg' },
      { name: 'Classic Margerita Pizza', type: 'veg' },
      { name: 'Garlic Bread', type: 'veg' },
      { name: 'Paneer Tikka', type: 'veg', isChefSpecial: true },
    ],
  },
  {
    id: 'nonvegstarters',
    title: 'Non-Veg Starters',
    subtitle: 'For the carnivores',
    icon: <Drumstick className="w-5 h-5" />,
    items: [
      { name: 'Bharwan Chicken Tikka', type: 'nonveg', isChefSpecial: true },
      { name: 'Fish Fingers', type: 'nonveg', isChefSpecial: true },
    ],
  },
  {
    id: 'mains',
    title: 'Main Course',
    subtitle: 'The grand feast',
    icon: <ChefHat className="w-5 h-5" />,
    items: [
      { name: 'Chilli Garlic Noodles', type: 'veg' },
      { name: 'Veg Manchurian', type: 'veg' },
      { name: 'Subz Dum Biryani', type: 'veg', isChefSpecial: true },
      { name: 'Hyderabadi Chicken Dum Biryani', type: 'nonveg', isChefSpecial: true },
    ],
  },
  {
    id: 'dessert',
    title: 'Dessert',
    subtitle: 'The sweet finale',
    icon: <CakeSlice className="w-5 h-5" />,
    items: [
      { name: 'Tiramisu', type: 'veg', isChefSpecial: true },
    ],
  },
];

const MenuItemRow = ({ item, index }: { item: MenuItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
    className="group"
  >
    <div className="flex items-center gap-4 py-3.5 px-3 border-b border-gold/[0.06] last:border-0 group-hover:bg-gold/[0.03] transition-colors rounded-lg">
      <div className="shrink-0">
        {item.type === 'nonveg' ? <NonVegIcon /> : <VegIcon />}
      </div>
      <div className="flex-1 flex items-end gap-1 min-w-0">
        <span className="text-champagne font-display text-sm md:text-base tracking-wide whitespace-nowrap group-hover:text-gold transition-colors duration-300">
          {item.name}
        </span>
        <div className="flex-1 border-b border-dotted border-gold/10 mb-1 mx-1" />
      </div>
      {item.isChefSpecial && (
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="shrink-0"
        >
          <Star className="w-3.5 h-3.5 text-gold fill-gold/60" />
        </motion.div>
      )}
    </div>
  </motion.div>
);

const MenuSectionCard = ({ section, index }: { section: MenuSection; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, type: 'spring' }}
      className="relative"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(10,10,10,0.95), rgba(0,0,0,0.98))',
          border: '1px solid rgba(212, 175, 55, 0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.05)',
        }}
      >
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, hsl(45 100% 50% / 0.4), transparent)' }} />

        <div className="px-6 pt-5 pb-3 flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gold shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.2)',
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {section.icon}
          </motion.div>
          <div className="min-w-0">
            <h3 className="font-cinzel text-gold text-lg md:text-xl tracking-wider">{section.title}</h3>
            <p className="text-champagne/30 text-[10px] md:text-xs uppercase tracking-[0.2em] italic">{section.subtitle}</p>
          </div>
        </div>

        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)' }} />

        <div className="px-5 py-3 pb-5">
          {section.items.map((item, i) => (
            <MenuItemRow key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Menu = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const getVariant = () => {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
  };

  return (
    <PageLayout showNav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-[calc(100dvh-5rem)] px-4 md:px-8 lg:px-12 py-6"
      >
        {/* Progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
          style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg, transparent, hsl(45 100% 50%), transparent)' }}
        />

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/regulations')}
          className="flex items-center gap-2 text-gold mb-6 hover:text-champagne transition-colors group"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="group-hover:underline">Back to Activities</span>
        </motion.button>

        <PremiumHeading
          title="The Menu"
          subtitle="A culinary journey curated for the finest evening"
          variant={getVariant()}
        />

        {/* Sections */}
        <div className="max-w-lg mx-auto space-y-8 mt-8">
          {sections.map((section, index) => (
            <MenuSectionCard key={section.id} section={section} index={index} />
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 max-w-lg mx-auto"
        >
          <div
            className="flex flex-wrap justify-center gap-5 py-4 px-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(212,175,55,0.02))',
              border: '1px solid rgba(212, 175, 55, 0.08)',
            }}
          >
            <div className="flex items-center gap-2 text-[10px] text-gold/50 uppercase tracking-[0.15em]">
              <VegIcon />
              <span>Vegetarian</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gold/50 uppercase tracking-[0.15em]">
              <NonVegIcon />
              <span>Non-Veg</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gold/50 uppercase tracking-[0.15em]">
              <Star className="w-3.5 h-3.5 text-gold fill-gold/50" />
              <span>Chef's Pick</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center pb-20"
        >
          <motion.div
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center gap-3"
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <Sparkles className="w-4 h-4 text-gold/40" />
            <p className="text-gold/40 italic text-sm font-cinzel tracking-[0.15em]">Bon Appétit</p>
            <Sparkles className="w-4 h-4 text-gold/40" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
          </motion.div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default Menu;
