import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import { motion, useInView } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowLeft, Star, Sparkles, Crown, Music, Camera, Utensils, Users, Shirt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useRef } from 'react';

const partyInfo = [
  { icon: Calendar, label: 'Date', value: '24th March 2026', color: 'from-gold to-champagne', link: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=THE+WORST+BATCH+-+Grand+Farewell+Party&dates=20260324T103000Z/20260324T150000Z&details=The+Grand+Farewell+Party&location=HASAPI,+De+Hamrey' },
  { icon: Clock, label: 'Time', value: '4:00 PM - 8:30 PM', color: 'from-champagne to-gold' },
  { icon: MapPin, label: 'Venue', value: 'HASAPI, De\' Hamrey', color: 'from-gold to-copper', link: 'https://maps.app.goo.gl/rKXuY2jLS7i3PLig7' },
];

const highlights = [
  { icon: Music, title: 'Live Music & DJ', description: 'Non-stop beats all evening' },
  { icon: Camera, title: 'Photo Booth', description: 'Capture premium memories' },
  { icon: Utensils, title: 'Curated Menu', description: 'Handpicked gourmet bites' },
  { icon: Users, title: 'Batch Reunion', description: 'The ultimate gathering' },
];

const schedule = [
  { time: '4:00 PM', event: 'Grand Entry & Welcome', icon: Sparkles },
  { time: '4:30 PM', event: 'Opening Ceremony', icon: Crown },
  { time: '5:00 PM', event: 'Games & Activities', icon: Star },
  { time: '6:00 PM', event: 'Dinner & Refreshments', icon: Utensils },
  { time: '7:00 PM', event: 'Dance Floor Opens', icon: Music },
  { time: '8:30 PM', event: 'Grand Farewell', icon: Sparkles },
];

const TimelineItem = ({ slot, index }: { slot: typeof schedule[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = slot.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.5, type: 'spring', stiffness: 100 }}
      className="flex items-center gap-4 py-4 relative"
    >
      {/* Connector line glow */}
      {isInView && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.12 + 0.3, duration: 0.4 }}
          className="absolute left-6 top-0 w-px h-full origin-top"
          style={{ background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.4), transparent)' }}
        />
      )}
      
      <motion.div
        animate={isInView ? { 
          scale: [1, 1.15, 1],
          boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 20px rgba(212,175,55,0.4)', '0 0 8px rgba(212,175,55,0.2)']
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
        className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(0,0,0,0.8))',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
        }}
      >
        <Icon className="w-5 h-5 text-gold" />
      </motion.div>
      <motion.div 
        className="flex-1 rounded-xl p-3"
        style={{
          background: isInView ? 'linear-gradient(135deg, rgba(212,175,55,0.04), transparent)' : 'transparent',
          border: isInView ? '1px solid rgba(212,175,55,0.1)' : '1px solid transparent',
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.12 + 0.2 }}
      >
        <p className="text-gold text-xs uppercase tracking-widest font-medium">{slot.time}</p>
        <p className="text-champagne font-display text-sm md:text-base mt-0.5">{slot.event}</p>
      </motion.div>
    </motion.div>
  );
};

const EventDetails = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();

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
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/regulations')}
          className="flex items-center gap-2 text-gold mb-6 hover:text-champagne transition-colors group"
        >
          <motion.div animate={{ x: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.div>
          <span className="group-hover:underline">Back to Activities</span>
        </motion.button>

        <PremiumHeading 
          title="Party Details" 
          subtitle="Mark your calendar for the grand celebration"
          variant={getVariant()}
        />

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0.6) 50%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <motion.div className="absolute top-4 right-6" animate={{ rotate: 360, opacity: [0.3, 1, 0.3] }} transition={{ duration: 6, repeat: Infinity }}>
              <Sparkles className="w-6 h-6 text-gold/40" />
            </motion.div>
            <motion.div className="absolute bottom-4 left-6" animate={{ rotate: -360, opacity: [0.5, 1, 0.5] }} transition={{ duration: 8, repeat: Infinity }}>
              <Star className="w-5 h-5 text-champagne/30 fill-champagne/10" />
            </motion.div>
            <div className="text-center relative z-10">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Crown className="w-10 h-10 md:w-12 md:h-12 text-gold mx-auto mb-3" />
              </motion.div>
              <h3 className="text-gold font-display text-xl md:text-2xl mb-2">THE WORST BATCH</h3>
              <p className="text-champagne/60 text-sm md:text-base">The Grand Farewell Party</p>
            </div>
          </div>
        </motion.div>

        {/* Party Info Cards */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {partyInfo.map((item, index) => {
            const content = (
              <Card className="card-shimmer overflow-hidden group">
                <CardContent className="flex items-center gap-4 md:gap-6 p-5 md:p-6 relative">
                  <motion.div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <motion.div
                    animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                    className="relative z-10"
                  >
                    <item.icon className="w-10 h-10 md:w-12 md:h-12 text-gold group-hover:text-champagne transition-colors" />
                  </motion.div>
                  <div className="flex-1 relative z-10">
                    <p className="text-gold/70 text-sm mb-1">{item.label}</p>
                    <p className="text-champagne font-semibold font-display" style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>{item.value}</p>
                  </div>
                  {'link' in item && item.link && (
                    <ArrowRight className="w-5 h-5 text-gold/40 group-hover:text-gold transition-colors relative z-10" />
                  )}
                </CardContent>
              </Card>
            );

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.15, duration: 0.5, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                {'link' in item && item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </a>
                ) : content}
              </motion.div>
            );
          })}

        </div>

        {/* Highlights */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-gold/60" />
            <h3 className="text-gold font-display text-lg md:text-xl">What Awaits You</h3>
            <Sparkles className="w-4 h-4 text-gold/60" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="card-shimmer rounded-xl p-4 text-center relative overflow-hidden group"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
                  className="relative z-10"
                >
                  <item.icon className="w-8 h-8 md:w-10 md:h-10 text-gold mx-auto mb-2" />
                </motion.div>
                <p className="text-champagne font-display text-sm md:text-base relative z-10">{item.title}</p>
                <p className="text-gold/50 text-xs mt-1 relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-gold/60" />
            <h3 className="text-gold font-display text-lg md:text-xl">Schedule</h3>
          </div>
          <div className="space-y-0 relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-gold/40 via-gold/15 to-transparent" />
            {schedule.map((slot, index) => (
              <TimelineItem key={slot.time} slot={slot} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Dress Code Quick Preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shirt className="w-4 h-4 text-gold/60" />
            <h3 className="text-gold font-display text-lg md:text-xl">Dress Code</h3>
          </div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate('/dress-code')}
            className="card-shimmer rounded-xl p-5 md:p-6 cursor-pointer group relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.06) 0%, transparent 70%)' }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-champagne font-display text-base md:text-lg mb-1">Premium Formal</p>
                <p className="text-gold/50 text-xs md:text-sm">Black, gold & elegant — no exceptions</p>
              </div>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors" />
              </motion.div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 relative z-10">
              {['Suits & Blazers', 'Gowns & Dresses', 'No Casuals'].map((tag, i) => (
                <span
                  key={i}
                  onClick={() => navigate('/dress-code')}
                  className="text-xs px-3 py-1 rounded-full border border-gold/20 text-gold/60 cursor-pointer hover:border-gold/50 hover:text-gold transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="mt-4 md:mt-8 text-center pb-[120px]">
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="card-shimmer inline-block px-6 md:px-8 py-3 md:py-4"
          >
            <p className="text-gold/70 italic" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)' }}>
              An evening you won't forget...
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default EventDetails;
