import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  LogOut,
  Sparkles,
  IdCard,
  UserCircle,
  Trophy,
  Lock,
  Award,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import ConfettiEffect from '@/components/ConfettiEffect';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { db } from '@/firebase';

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  unlocked: boolean;
  description: string;
}

const DEFAULT_COMMENT = 'The worst batch. The best memories.';

const GeneratedAvatar = ({
  gender,
  className
}: {
  gender: string;
  className?: string;
}) => {
  const iconClassName =
    gender === 'Male'
      ? 'text-gold'
      : gender === 'Female'
        ? 'text-pink-300'
        : 'text-champagne';

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-gold/30 ${className}`}
    >
      <UserCircle className={`w-20 h-20 ${iconClassName}`} />
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const deviceType = useDeviceType();

  const [rsvpDone, setRsvpDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!user?.entryId) {
      return;
    }

    const ref = doc(db, 'rsvps', user.entryId);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setRsvpDone(snapshot.exists());
      },
      (error) => {
        console.error(error);
        toast.error('Unable to refresh your profile status right now.');
      }
    );

    return () => unsubscribe();
  }, [user?.entryId]);

  const badges: Badge[] = [
    {
      id: 'rsvp',
      name: 'RSVP Done',
      icon: <Award className="w-5 h-5" />,
      unlocked: rsvpDone,
      description: 'Confirmed attendance'
    },
    {
      id: 'paid',
      name: 'Paid',
      icon: <CreditCard className="w-5 h-5" />,
      unlocked: true,
      description: 'Payment completed'
    }
  ];

  const allBadgesUnlocked = badges.every((badge) => badge.unlocked);
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  useEffect(() => {
    if (!allBadgesUnlocked) {
      return;
    }

    const confettiShown = sessionStorage.getItem('profile_confetti_shown');

    if (!confettiShown) {
      setShowConfetti(true);
      sessionStorage.setItem('profile_confetti_shown', 'true');
    }
  }, [allBadgesUnlocked]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-6 text-gold">
          Loading your profile...
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-6 text-gold">
          Redirecting to login...
        </div>
      </PageLayout>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const variant =
    deviceType === 'mobile'
      ? 'mobile'
      : deviceType === 'tablet'
        ? 'tablet'
        : 'desktop';

  const genderLabel = user.gender === 'Unknown' ? 'Not available' : user.gender;

  return (
    <PageLayout>
      <ConfettiEffect
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center min-h-[calc(100dvh-5rem)] px-4 py-6 pb-24"
      >
        <PremiumHeading title="Guest Profile" variant={variant} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md card-shimmer p-6 md:p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="w-28 h-28 mx-auto mb-5"
          >
            <GeneratedAvatar gender={user.gender} className="w-28 h-28" />
          </motion.div>

          <div className="text-center mb-5">
            <h2 className="text-2xl font-display font-bold text-gradient-shimmer">
              {user.name}
            </h2>
          </div>

          <div className="flex gap-4 mb-5">
            <div className="flex-1 rounded-xl p-3 text-center border border-gold/15">
              <IdCard className="w-4 h-4 text-gold mx-auto mb-1" />

              <p className="text-gold/60 text-[10px] uppercase tracking-widest">
                Entry ID
              </p>

              <p className="text-champagne font-display font-semibold text-sm">
                {user.entryId}
              </p>
            </div>

            <div className="flex-1 rounded-xl p-3 text-center border border-gold/15">
              <UserCircle className="w-4 h-4 text-gold mx-auto mb-1" />

              <p className="text-gold/60 text-[10px] uppercase tracking-widest">
                Gender
              </p>

              <p className="text-champagne font-display font-semibold text-sm">
                {genderLabel}
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="italic text-champagne/70 text-sm">
              "{DEFAULT_COMMENT}"
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-gold" />

              <p className="text-gold text-xs uppercase tracking-widest font-medium">
                Achievements ({unlockedCount}/{badges.length})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl p-3 text-center border border-gold/20"
                  title={badge.description}
                >
                  <div
                    className={`mx-auto mb-1.5 ${badge.unlocked ? 'text-gold' : 'text-gold/20'}`}
                  >
                    {badge.icon}
                  </div>

                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${badge.unlocked ? 'text-champagne' : 'text-gold/25'}`}
                  >
                    {badge.name}
                  </p>

                  {!badge.unlocked && (
                    <Lock className="w-3 h-3 text-gold/20 mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={handleLogout}
          className="w-full max-w-md mt-5 py-3.5 rounded-xl text-gold border border-gold/30 flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>

        <motion.div className="mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold/50" />
            <p className="text-xs italic text-champagne/40">
              Welcome to the celebration
            </p>
            <Sparkles className="w-3 h-3 text-gold/50" />
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default Profile;
