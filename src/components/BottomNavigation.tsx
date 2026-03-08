import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Images, Scale, BookOpen, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/about', label: 'About Us', icon: Users },
  { path: '/sneak', label: 'Sneak Peek', icon: Images },
  { path: '/regulations', label: 'Activities', icon: Scale },
  { path: '/rules', label: 'Rules', icon: BookOpen },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleNavClick = (path: string) => {
    if (path === '/profile' && !isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-gold-dark/50"
    >
      <div className="flex justify-around items-center h-16 sm:h-20 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'text-gold' : 'text-muted-foreground hover:text-gold'
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-[60px]">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-12 h-0.5 bg-gold rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
