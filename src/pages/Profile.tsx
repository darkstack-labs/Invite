import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Sparkles, IdCard, UserCircle, Trophy, Lock, Award, CreditCard, BookCheck } from 'lucide-react';
import PremiumHeading from '@/components/PremiumHeading';
import { useDeviceType } from '@/hooks/useDeviceType';
import ConfettiEffect from '@/components/ConfettiEffect';

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  unlocked: boolean;
  description: string;
}

const MaleAvatar = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700, #D4AF37)', padding: '3px' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
    <div className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)' }}>
      <svg viewBox="0 0 80 80" fill="none" className="w-[85%] h-[85%]">
        <circle cx="40" cy="28" r="14" fill="url(#skinGradientM)"/>
        <path d="M20 80V55C20 45 28 38 40 38C52 38 60 45 60 55V80" fill="#1a1a1a"/>
        <path d="M35 38L40 50L45 38" fill="#fff"/>
        <path d="M38 46L40 50L42 46L40.5 62L40 64L39.5 62Z" fill="url(#tieGradientM)"/>
        <path d="M35 38L28 55L32 80" fill="none" stroke="#2a2a2a" strokeWidth="1.5"/>
        <path d="M45 38L52 55L48 80" fill="none" stroke="#2a2a2a" strokeWidth="1.5"/>
        <path d="M26 25C26 16 32 10 40 10C48 10 54 16 54 25C54 25 52 18 40 18C28 18 26 25 26 25Z" fill="#2D1810"/>
        <defs>
          <linearGradient id="skinGradientM" x1="30" y1="20" x2="50" y2="40"><stop offset="0%" stopColor="#F5D0B0"/><stop offset="100%" stopColor="#E8C0A0"/></linearGradient>
          <linearGradient id="tieGradientM" x1="40" y1="46" x2="40" y2="64"><stop offset="0%" stopColor="#D4AF37"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

const FemaleAvatar = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700, #D4AF37)', padding: '3px' }}
      animate={{ rotate: [0, -360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
    <div className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)' }}>
      <svg viewBox="0 0 80 80" fill="none" className="w-[85%] h-[85%]">
        <ellipse cx="40" cy="32" rx="20" ry="22" fill="#2D1810"/>
        <path d="M20 35C20 35 22 55 26 70C26 70 32 45 40 45C48 45 54 70 54 70C58 55 60 35 60 35" fill="#2D1810"/>
        <ellipse cx="40" cy="30" rx="14" ry="15" fill="url(#skinGradientF)"/>
        <path d="M24 80V58C24 50 32 44 40 44C48 44 56 50 56 58V80" fill="url(#dressGradientF)"/>
        <path d="M32 46C36 48 44 48 48 46" stroke="#FFD700" strokeWidth="1.2" fill="none"/>
        <circle cx="40" cy="48" r="2" fill="#FFD700"/>
        <circle cx="24" cy="34" r="2" fill="#FFD700"/>
        <circle cx="56" cy="34" r="2" fill="#FFD700"/>
        <defs>
          <linearGradient id="skinGradientF" x1="30" y1="18" x2="50" y2="45"><stop offset="0%" stopColor="#F8E0D0"/><stop offset="100%" stopColor="#F0D0C0"/></linearGradient>
          <linearGradient id="dressGradientF" x1="40" y1="44" x2="40" y2="80"><stop offset="0%" stopColor="#1a1a1a"/><stop offset="100%" stopColor="#0a0a0a"/></linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

// --- Main Component ---

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const deviceType = useDeviceType();

  // Moved RULES_STORAGE_KEY inside the component so it has access to 'user'
  const RULES_STORAGE_KEY = user
    ? `party_rules_acknowledged_${user.entryId}`
    : "party_rules_acknowledged_temp";

  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setRulesAcknowledged(Array.isArray(parsed) && parsed.every(Boolean));
    } catch {
      localStorage.removeItem(RULES_STORAGE_KEY);
    }
  }, [RULES_STORAGE_KEY]);

  const rsvpDone = !!localStorage.getItem(`rsvp_submitted_${user?.entryId}`);

  const badges: Badge[] = [
    { id: 'rsvp', name: 'RSVP Done', icon: <Award className="w-5 h-5" />, unlocked: rsvpDone, description: 'Confirmed attendance' },
    { id: 'paid', name: 'Paid', icon: <CreditCard className="w-5 h-5" />, unlocked: true, description: 'Payment completed' },
    { id: 'rules', name: 'Rules', icon: <BookCheck className="w-5 h-5" />, unlocked: rulesAcknowledged, description: 'Acknowledged all rules' },
  ];

  const allBadgesUnlocked = badges.every(b => b.unlocked);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  useEffect(() => {
    if (allBadgesUnlocked) {
      const confettiShown = sessionStorage.getItem('profile_confetti_shown');
      if (!confettiShown) {
        setShowConfetti(true);
        sessionStorage.setItem('profile_confetti_shown', 'true');
      }
    }
  }, [allBadgesUnlocked]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <PageLayout>
      <ConfettiEffect isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center min-h-[calc(100dvh-5rem)] px-4 py-6 relative overflow-hidden pb-24"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-20 -left-20 w-60 h-60 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-40 -right-20 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <PremiumHeading title="Guest Profile" variant={deviceType === 'mobile' ? 'mobile' : deviceType === 'tablet' ? 'tablet' : 'desktop'} />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md card-shimmer p-6 md:p-8 relative overflow-hidden"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.06) 50%, transparent 70%)' }}
            animate={{ x: [-300, 300] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="w-28 h-28 mx-auto mb-5 relative z-10"
          >
            {user.gender === 'Male' ? <MaleAvatar className="w-28 h-28" /> : <FemaleAvatar className="w-28 h-28" />}
          </motion.div>

          {/* Name & Nickname */}
          <div className="text-center mb-5 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-display font-bold text-gradient-shimmer"
            >
              {user.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-champagne/60 italic text-sm mt-1"
            >
              "{user.nickname}"
            </motion.p>
          </div>

          {/* Divider */}
          <div className="w-16 h-px mx-auto mb-5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* Info Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mb-5 relative z-10"
          >
            <div className="flex-1 rounded-xl p-3 text-center" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.15)',
            }}>
              <IdCard className="w-4 h-4 text-gold mx-auto mb-1" />
              <p className="text-gold/60 text-[10px] uppercase tracking-widest">Entry ID</p>
              <p className="text-champagne font-display font-semibold text-sm">{user.entryId}</p>
            </div>
            <div className="flex-1 rounded-xl p-3 text-center" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(212,175,55,0.05))',
              border: '1px solid rgba(212,175,55,0.15)',
            }}>
              <UserCircle className="w-4 h-4 text-gold mx-auto mb-1" />
              <p className="text-gold/60 text-[10px] uppercase tracking-widest">Gender</p>
              <p className="text-champagne font-display font-semibold text-sm">{user.gender}</p>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-6 relative z-10 p-3 rounded-lg"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.04), transparent)', border: '1px solid rgba(212,175,55,0.08)' }}
          >
            <p className="italic text-champagne/70 text-sm">"{user.comment}"</p>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-gold" />
              <p className="text-gold text-xs uppercase tracking-widest font-medium">
                Achievements ({unlockedCount}/{badges.length})
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="relative rounded-xl p-3 text-center overflow-hidden"
                  style={{
                    background: badge.unlocked
                      ? 'linear-gradient(160deg, rgba(212,175,55,0.12) 0%, rgba(184,134,11,0.06) 100%)'
                      : 'rgba(0,0,0,0.4)',
                    border: badge.unlocked
                      ? '1.5px solid rgba(212,175,55,0.4)'
                      : '1px solid rgba(212,175,55,0.08)',
                    boxShadow: badge.unlocked ? '0 0 20px rgba(212,175,55,0.08)' : 'none',
                  }}
                  title={badge.description}
                >
                  {badge.unlocked && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(212,175,55,0.1) 50%, transparent 70%)' }}
                      animate={{ x: [-80, 80] }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  )}
                  <div className={`mx-auto mb-1.5 relative z-10 ${badge.unlocked ? 'text-gold' : 'text-gold/20'}`}>
                    {badge.icon}
                  </div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider relative z-10 ${badge.unlocked ? 'text-champagne' : 'text-gold/25'}`}>
                    {badge.name}
                  </p>
                  {!badge.unlocked && <Lock className="w-3 h-3 text-gold/15 mx-auto mt-1" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full max-w-md mt-5 py-3.5 rounded-xl text-gold transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.03))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-6">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold/50" />
            <p className="text-xs italic text-champagne/40">Welcome to the celebration</p>
            <Sparkles className="w-3 h-3 text-gold/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default Profile;