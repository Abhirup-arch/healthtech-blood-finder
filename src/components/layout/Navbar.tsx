import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplet, LogOut, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithGoogle();
    navigate('/search');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' as const }}
      className="navbar glass-panel sticky top-4 mx-4 md:mx-auto max-w-7xl z-50 mt-6"
    >
      <div className="navbar-brand flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 border border-red-400/20"
          >
            <Droplet className="w-5 h-5 text-white fill-white/10" />
          </motion.div>
          <span className="text-xl font-semibold tracking-tight text-white group-hover:text-red-400 transition-colors">
            BloodLink<span className="text-red-500 font-bold">.</span>
          </span>
        </Link>
      </div>

      <div className="navbar-actions flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-350 hidden sm:inline-block">
              {user.displayName || user.email}
            </span>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-signout" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </motion.button>
          </div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-signin" 
            onClick={handleLogin}
          >
            <Shield className="w-4 h-4 mr-2 text-red-500" />
            Sign In with Google
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
