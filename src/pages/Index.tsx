import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import TypewriterText from '@/components/TypewriterText';
import { Crown, Sparkles, Star, KeyRound } from 'lucide-react';
import { guests } from '@/contexts/AuthContext';

// Floating ornamental line
const OrnamentalDivider = () => (
  <motion.div
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ delay: 2.6, duration: 1 }}
    className="flex items-center gap-3 my-4"
  >
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    <motion.div
      animate={{ rotate: [0, 180, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      <Star className="w-3 h-3 text-gold/40 fill-gold/20" />
    </motion.div>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showEntryId, setShowEntryId] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  const [phase, setPhase] = useState(0); // 0=nothing, 1=crown, 2=title, 3=card

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const normalizeName = (input: string) =>
    input
      .toLowerCase()
      .replace(/[^a-z]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const titleCaseName = (input: string) =>
    input
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

  const normalizedGuestMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(guests).forEach(([guestName, entryId]) => {
      map.set(normalizeName(guestName), entryId);
    });
    return map;
  }, []);

  const firstNameMap = useMemo(() => {
    const map = new Map<string, { entryId: string; fullName: string }[]>();
    Object.entries(guests).forEach(([guestName, entryId]) => {
      const first = normalizeName(guestName).split(' ')[0];
      if (!first) return;
      const list = map.get(first) ?? [];
      list.push({ entryId, fullName: guestName });
      map.set(first, list);
    });
    return map;
  }, []);

  const resolveGuest = (rawName: string) => {
    const normalized = normalizeName(rawName);
    if (!normalized) return { entryId: '', ambiguous: false };

    const exact = normalizedGuestMap.get(normalized);
    if (exact) return { entryId: exact, ambiguous: false };

    // If user enters only first name, allow only unique matches.
    const firstNameCandidates = firstNameMap.get(normalized);
    if (firstNameCandidates?.length === 1) {
      return { entryId: firstNameCandidates[0].entryId, ambiguous: false };
    }

    if (firstNameCandidates && firstNameCandidates.length > 1) {
      return { entryId: '', ambiguous: true };
    }

    return { entryId: '', ambiguous: false };
  };

  const { entryId: resolvedEntryId } = resolveGuest(name);
  const isGuest = Boolean(resolvedEntryId);

  const checkInvitation = () => {
    const raw = name.trim();
    const candidates = Array.from(
      new Set([
        raw,
        raw.replace(/_/g, ' '),
        titleCaseName(raw),
        titleCaseName(raw.replace(/_/g, ' '))
      ])
    );

    let entryId = '';
    let ambiguous = false;

    for (const candidate of candidates) {
      const result = resolveGuest(candidate);
      if (result.entryId) {
        entryId = result.entryId;
        break;
      }
      if (result.ambiguous) ambiguous = true;
    }

    const formatted = titleCaseName(raw.replace(/_/g, ' '));
    setName(formatted);
    if (entryId) {
      setMessage({ text: "You're on the list. Welcome to the madness!", type: 'success' });
      setShowEntryId(false);
    } else if (ambiguous) {
      setMessage({
        text: "Multiple guests share this first name. Please enter your full name.",
        type: 'error'
      });
      setShowEntryId(false);
    } else {
      setMessage({ text: "Oops — you didn't make the cut.", type: 'error' });
      setShowEntryId(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />

      <div className="fixed inset-0 bg-gradient-to-br from-black via-[#030303] to-[#0a0700] -z-10" />
      <ParticleBackground count={40} />

      {/* Corner ornaments */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-[1]">
        <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-gold/30 to-transparent" />
        <div className="absolute top-4 left-4 w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-[1]">
        <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-gold/30 to-transparent" />
        <div className="absolute top-4 right-4 w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none z-[1]">
        <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-gold/30 to-transparent" />
        <div className="absolute bottom-4 left-4 w-px h-16 bg-gradient-to-t from-gold/30 to-transparent" />
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-[1]">
        <div className="absolute bottom-4 right-4 w-16 h-px bg-gradient-to-l from-gold/30 to-transparent" />
        <div className="absolute bottom-4 right-4 w-px h-16 bg-gradient-to-t from-gold/30 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Login Button */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(212,175,55,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-gold/30 text-gold bg-black/60 backdrop-blur-sm"
                style={{ textShadow: '0 0 10px rgba(212,175,55,0.3)' }}
              >
                <KeyRound className="w-4 h-4" />
                Login
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {/* Phase 1: Grand crown entrance with multiple glows */}
          <AnimatePresence>
            {phase >= 1 && (
              <>
                {/* Multi-layer glow burst */}
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 4], opacity: [0.6, 0] }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="absolute w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.5), transparent 60%)' }}
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: [0, 6], opacity: [0.3, 0] }}
                  transition={{ duration: 3, ease: 'easeOut', delay: 0.3 }}
                  className="absolute w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2), transparent 70%)' }}
                />

                {/* Crown with dramatic drop */}
                <motion.div
                  initial={{ scale: 0, y: -200, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.2 }}
                  className="mb-2"
                >
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      filter: [
                        'drop-shadow(0 0 10px rgba(212,175,55,0.2))',
                        'drop-shadow(0 0 30px rgba(212,175,55,0.6))',
                        'drop-shadow(0 0 10px rgba(212,175,55,0.2))',
                      ],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Crown className="w-12 h-12 md:w-16 md:h-16 text-gold" />
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Phase 2: Title reveal */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-center mb-2"
              >
                <h1
                  className="font-cinzel font-bold text-gradient-gold tracking-[0.15em]"
                  style={{
                    fontSize: 'clamp(1.6rem, 7vw, 3.5rem)',
                    textShadow: '0 0 40px rgba(212,175,55,0.25), 0 4px 12px rgba(0,0,0,0.9)',
                  }}
                >
                  {showTypewriter ? (
                    <TypewriterText text="THE WORST BATCH" speed={100} delay={200} onComplete={() => setShowTypewriter(false)} />
                  ) : (
                    'THE WORST BATCH'
                  )}
                </h1>
                <motion.p
                  className="font-display italic text-champagne/60 mt-1 tracking-widest"
                  style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.3rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  ✦ Signing Off ✦
                </motion.p>

                <OrnamentalDivider />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Card */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
                className="w-full max-w-sm"
              >
                <div className="relative">
                  {/* Animated gold border */}
                  <motion.div
                    className="absolute -inset-px rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.03), rgba(212,175,55,0.25))',
                      backgroundSize: '200% 200%',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />

                  <div
                    className="relative rounded-2xl px-6 py-7 text-center backdrop-blur-sm"
                    style={{ background: 'linear-gradient(160deg, rgba(8,8,8,0.97), rgba(0,0,0,0.99))' }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold/30" />
                      <h2 className="font-cinzel font-semibold text-gold tracking-wider" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.2rem)' }}>
                        You're Invited
                      </h2>
                      <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold/30" />
                    </div>
                    <p className="text-muted-foreground text-xs mb-5 tracking-wide">Check if you made the exclusive list</p>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkInvitation()}
                      placeholder="Enter your first name"
                      className="input-gold w-full px-5 py-3 rounded-xl text-center text-sm font-medium mb-4"
                    />

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={checkInvitation}
                      className="btn-gold w-full py-3 rounded-xl font-bold text-sm tracking-wide"
                    >
                      Check My Invitation
                    </motion.button>

                    <AnimatePresence mode="wait">
                      {message && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`mt-4 p-3 rounded-lg text-sm font-semibold ${
                            message.type === 'success'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/10 border border-red-500/30 text-red-400'
                          }`}
                        >
                          {message.text}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {message && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-center mt-4"
                        >
                          {isGuest ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowEntryId(true)}
                              className="btn-gold px-5 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold"
                            >
                              <Star className="w-3.5 h-3.5" />
                              View Entry ID
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate('/missing')}
                              className="btn-gold px-5 py-2 rounded-lg text-xs font-semibold"
                            >
                              What You're Missing
                            </motion.button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showEntryId && isGuest && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-4"
                        >
                          <motion.div
                            animate={{
                              boxShadow: [
                                '0 0 15px rgba(212,175,55,0.2)',
                                '0 0 25px rgba(212,175,55,0.4)',
                                '0 0 15px rgba(212,175,55,0.2)',
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="inline-block px-6 py-3 rounded-xl border border-gold/40 bg-black/60"
                          >
                            <p className="text-[10px] text-champagne/40 mb-1 uppercase tracking-[0.2em]">Your Entry ID</p>
                            <p className="font-bold text-gold text-xl tracking-widest font-cinzel">
                              {resolvedEntryId}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 text-muted-foreground text-[10px] tracking-[0.15em]"
              >
                Already have your Entry ID? Click <span className="text-gold font-medium">Login</span> above
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
