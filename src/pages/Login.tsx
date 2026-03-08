import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Sparkles, Star, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!regNumber.trim()) {
      setError("Please enter your Entry ID.");
      return;
    }

    setIsLoading(true);
    setError('');

    if (!(regNumber.length === 4 || regNumber.length === 6)) {
      setError("Entry ID must be 4 or 6 digits.");
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    const success = login(regNumber.trim());

    if (success) { 
      setIsLoading(false);
      navigate('/home', { replace: true });
    } else {
      setError('Invalid Entry ID.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center bg-fixed relative flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 z-0" />
      <ParticleBackground count={50} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm mx-4 p-8 text-center card-shimmer rounded-2xl"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Crown className="w-10 h-10 text-champagne mx-auto icon-glow" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-4 left-4"
          animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-4 h-4 text-gold/40 fill-gold/20" />
        </motion.div>

        <motion.div
          className="absolute top-4 right-4"
          animate={{ opacity: [0.3, 0.8, 0.3], rotate: [360, 180, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-4 h-4 text-gold/40 fill-gold/20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-champagne" />
          </motion.div>

          <h2 className="text-2xl font-display text-gradient-gold">
            Login with Entry ID
          </h2>

          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-champagne" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-4"
        >
          <KeyRound className="w-8 h-8 text-gold mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <input
          maxLength={6}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={regNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setRegNumber(value);
            }}
            onKeyDown={handleKeyPress}
            placeholder="Enter your Entry ID"
            className="input-gold w-full px-4 py-3 rounded-xl text-center text-lg mb-6"
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={isLoading}
          className="btn-gold w-full py-3 rounded-xl text-base font-semibold disabled:opacity-70"
        >
          {isLoading ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Verifying...
            </motion.span>
          ) : (
            'Login'
          )}
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.7 }}
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02, opacity: 1 }}
          className="mt-6 text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          ← Back to Invitation Check
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;