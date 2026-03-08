import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Crown, Ban, Check, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import dresscodeGeneral from '@/assets/dresscode-general.jpg';
import dresscodeMen from '@/assets/dresscode-men.jpg';
import dresscodeWomen from '@/assets/dresscode-women.jpg';
import menOutfit1 from '@/assets/men-outfit-1.png';
import menOutfit2 from '@/assets/men-outfit-2.png';
import menOutfit3 from '@/assets/men-outfit-3.png';
import menOutfit4 from '@/assets/men-outfit-4.png';
import womenOutfit1 from '@/assets/women-outfit-1.png';
import womenOutfit2 from '@/assets/women-outfit-2.png';
import womenOutfit3 from '@/assets/women-outfit-3.png';
import womenOutfit4 from '@/assets/women-outfit-4.png';

type Tab = 'general' | 'men' | 'women';

// Color swatches for each category
const colorSwatches: Record<Tab, { color: string; name: string }[]> = {
  general: [
    { color: '#1a1a1a', name: 'Black' },
    { color: '#2c3e50', name: 'Navy' },
    { color: '#4a4a4a', name: 'Charcoal' },
    { color: '#f5f5dc', name: 'Beige' },
    { color: '#fffdd0', name: 'Cream' },
    { color: '#ffffff', name: 'White' },
  ],
  men: [
    { color: '#1a1a1a', name: 'Black' },
    { color: '#1e3a5f', name: 'Navy' },
    { color: '#36454f', name: 'Charcoal' },
    { color: '#d4a574', name: 'Tan' },
    { color: '#f5f5dc', name: 'Beige' },
    { color: '#fffdd0', name: 'Cream' },
    { color: '#ffffff', name: 'White' },
    { color: '#8b7355', name: 'Taupe' },
  ],
  women: [
    { color: '#1a1a1a', name: 'Black' },
    { color: '#fffff0', name: 'Ivory' },
    { color: '#1e3a5f', name: 'Navy' },
    { color: '#36454f', name: 'Charcoal' },
    { color: '#8b7355', name: 'Taupe' },
    { color: '#e8d5d5', name: 'Blush' },
    { color: '#4a0e4e', name: 'Deep Plum' },
    { color: '#0f4c5c', name: 'Teal' },
  ],
};

// Reference images for men and women
const menImages = [menOutfit1, menOutfit2, menOutfit3, menOutfit4];
const womenImages = [womenOutfit1, womenOutfit2, womenOutfit3, womenOutfit4];

const generalRules = [
  { text: 'Elegant monotone outfits in clean, sophisticated silhouettes', type: 'allowed' },
  { text: 'Neutral-toned sneakers paired with refined ensembles', type: 'allowed' },
  { text: 'Smart watches — classic timepieces preferred', type: 'warning' },
  { text: 'Vibrant or bold color palettes in attire', type: 'warning' },
  { text: 'Athletic footwear or sports shoes', type: 'forbidden' },
  { text: 'Denim of any style or wash', type: 'forbidden' },
];

const menRules = [
  { text: 'Footwear: Dress shoes, loafers, formal boots, or neutral sneakers', type: 'allowed' },
  { text: 'Colour Palette: Black, Navy, Charcoal, Beige, Cream, White, Taupe, Stone', type: 'allowed' },
  { text: 'Tailored trousers or well-fitted pants (avoid skinny fit)', type: 'allowed' },
  { text: 'Flannel or structured layers as hoodie alternatives', type: 'allowed' },
  { text: 'Ties, bowties, and cuff links — optional for semi-formal settings', type: 'allowed' },
  { text: 'Excessive gold jewelry — keep accessories minimal', type: 'warning' },
  { text: 'Vibrant colours, bold patterns, or graphic-heavy designs', type: 'forbidden' },
];

const womenRules = [
  { text: 'Footwear: Heels, formal sandals, elegant boots, or neutral sneakers', type: 'allowed' },
  { text: 'Colour Palette: Black, Ivory, Navy, Charcoal, Taupe, Muted Pastels, Deep Jewel Tones', type: 'allowed' },
  { text: 'Sophisticated co-ord sets, jumpsuits, or tailored separates', type: 'allowed' },
  { text: 'Monotone or minimal colour combinations for refined elegance', type: 'allowed' },
  { text: 'Vibrant or neon shades — opt for muted alternatives', type: 'warning' },
  { text: 'Oversized or flashy jewelry — understated pieces preferred', type: 'warning' },
  { text: 'Smart watches — classic timepieces or none recommended', type: 'warning' },
  { text: 'Loud prints, heavy graphics, or distressed fabrics', type: 'forbidden' },
  { text: 'Ripped, casual, or overly relaxed garments', type: 'forbidden' },
];

const inspirationImages: Record<Tab, string> = {
  general: dresscodeGeneral,
  men: dresscodeMen,
  women: dresscodeWomen,
};

// Man suit/tuxedo icon component
const ManSuitIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Suit jacket outline */}
    <path d="M6 22V8L9 4H15L18 8V22H6Z" />
    {/* Lapels */}
    <path d="M9 4L12 10L15 4" />
    {/* Center line / tie */}
    <path d="M12 10V22" />
    {/* Collar points */}
    <path d="M10 4L9 6" />
    <path d="M14 4L15 6" />
    {/* Bow tie */}
    <path d="M10.5 8.5L12 9.5L13.5 8.5" />
    <path d="M10.5 10.5L12 9.5L13.5 10.5" />
  </svg>
);

// Woman dress icon component
const WomanDressIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 5.5 10 6.5 10.5 7L8 12L6 22H18L16 12L13.5 7C14 6.5 14.5 5.5 14.5 4.5C14.5 3 13.5 2 12 2Z" />
    <path d="M9.5 4.5H14.5" />
  </svg>
);

const TabletDressCodeLayout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'forbidden':
        return <Ban className="w-5 h-5 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'allowed':
        return <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getCurrentRules = () => {
    switch (activeTab) {
      case 'men':
        return menRules;
      case 'women':
        return womenRules;
      default:
        return generalRules;
    }
  };

  const getCurrentImages = () => {
    switch (activeTab) {
      case 'men':
        return menImages;
      case 'women':
        return womenImages;
      default:
        return null;
    }
  };

  const handlePrevImage = () => {
    const images = getCurrentImages();
    if (images) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    const images = getCurrentImages();
    if (images) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Crown className="w-4 h-4" /> },
    { id: 'men', label: 'Men', icon: <ManSuitIcon className="w-4 h-4" /> },
    { id: 'women', label: 'Women', icon: <WomanDressIcon className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setCurrentImageIndex(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100dvh-5rem)] px-6 py-8 relative overflow-hidden"
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 -left-32 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-32 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gold/25"
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [-12, 12, -12],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/regulations')}
        className="flex items-center gap-2 text-gold mb-6 hover:text-champagne transition-colors group relative z-10"
      >
        <motion.div
          animate={{ x: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.div>
        <span className="group-hover:underline">Back to Activities</span>
      </motion.button>

      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-4 relative inline-block"
        >
          <motion.div
            animate={{ 
              y: [0, -7, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative"
          >
            <Crown className="w-12 h-12 text-gold mx-auto" style={{
              filter: 'drop-shadow(0 0 22px rgba(212, 175, 55, 0.65))'
            }} />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        <motion.div className="flex items-center justify-center gap-4 mb-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-gold/60" />
          </motion.div>
          <h1 className="font-display text-gradient-gold font-bold text-3xl tracking-wide">
            Cocktail Attire
          </h1>
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-gold/60" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gold italic text-sm tracking-[0.15em] uppercase"
        >
          Elegant • Sophisticated • Timeless
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="relative w-40 h-[2px] mx-auto mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </motion.div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-3 mb-6 relative z-10"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-gold'
                : 'text-muted-foreground hover:text-champagne'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBgTablet"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  boxShadow: '0 0 25px rgba(212, 175, 55, 0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Side-by-Side Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10"
        >
          {/* Inspiration Image / Carousel */}
          <div className="relative rounded-2xl overflow-hidden" style={{
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.12)',
          }}>
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
              }}
              animate={{ x: [-400, 400] }}
              transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, rgba(212, 175, 55, 0.06) 50%, transparent 70%)',
              }}
              animate={{ x: [400, -400] }}
              transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1 }}
            />
            
            {activeTab === 'general' ? (
              <div className="w-full min-h-[400px] bg-black/50 flex items-center justify-center">
                <img 
                  src={inspirationImages[activeTab]} 
                  alt={`${activeTab} outfit inspiration`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full min-h-[400px] bg-black/50 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={getCurrentImages()?.[currentImageIndex]}
                    alt={`${activeTab} outfit reference ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                
                {/* Navigation arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-gold hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-gold hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                  {getCurrentImages()?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-gold w-5' 
                          : 'bg-gold/40 hover:bg-gold/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-gold text-sm font-medium uppercase tracking-widest">
                {activeTab === 'general' ? 'Style Inspiration' : `Reference ${currentImageIndex + 1} of ${getCurrentImages()?.length}`}
              </p>
            </div>
          </div>

          {/* Rules Card */}
          <div className="flex flex-col gap-4">
            {/* Color Swatches - Only show for men/women tabs */}
            {activeTab !== 'general' && (
              <div className="p-4 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.9) 0%, rgba(15, 15, 18, 0.95) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}>
                <p className="text-gold text-xs font-medium uppercase tracking-widest mb-3">
                  Recommended Colors
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colorSwatches[activeTab].map((swatch, index) => (
                    <motion.div
                      key={swatch.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index, type: 'spring' }}
                      className="group relative"
                    >
                      <div
                        className="w-9 h-9 rounded-full border-2 border-gold/30 shadow-lg cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: swatch.color }}
                      />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        <span className="text-[10px] text-champagne/70 bg-black/80 px-1.5 py-0.5 rounded">
                          {swatch.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <Card className="overflow-hidden relative flex-1" style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.92) 0%, rgba(15, 15, 18, 0.96) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.22)',
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(212, 175, 55, 0.1)',
            }}>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.04) 50%, transparent 70%)',
                }}
                animate={{ x: [-400, 400] }}
                transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(-45deg, transparent 30%, rgba(212, 175, 55, 0.03) 50%, transparent 70%)',
                }}
                animate={{ x: [400, -400] }}
                transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1 }}
              />
              
              <CardContent className="p-5 relative h-full flex flex-col">
                <div className="space-y-2.5 flex-1 overflow-auto">
                  {getCurrentRules().map((rule, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gold/5 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(212, 175, 55, 0.02) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.08)',
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {getRuleIcon(rule.type)}
                      </motion.div>
                      <p className="text-champagne/90 text-sm leading-relaxed group-hover:text-champagne transition-colors">
                        {rule.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Warning Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center relative z-10"
      >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 25px rgba(239, 68, 68, 0.1), 0 0 50px rgba(212, 175, 55, 0.1)',
              '0 0 35px rgba(239, 68, 68, 0.2), 0 0 70px rgba(212, 175, 55, 0.15)',
              '0 0 25px rgba(239, 68, 68, 0.1), 0 0 50px rgba(212, 175, 55, 0.1)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block px-6 py-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(20, 20, 25, 0.9) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <p className="text-red-400/90 font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Failure to abide will result in possible denied entry
          </p>
        </motion.div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex justify-center gap-5 text-sm relative z-10"
      >
        {[
          { icon: <Check className="w-4 h-4 text-emerald-400" />, label: 'Allowed' },
          { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, label: 'Caution' },
          { icon: <Ban className="w-4 h-4 text-red-400" />, label: 'Forbidden' },
        ].map((item) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(212, 175, 55, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.12)',
            }}
            whileHover={{ scale: 1.05, y: -1 }}
          >
            {item.icon}
            <span className="text-champagne/70">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TabletDressCodeLayout;
