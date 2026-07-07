import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Droplet, Heart, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';
import './LandingPage.css';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  }
};

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container min-h-screen relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Cinematic Ambient Grid and Glow Orbs */}
      <div className="grid-overlay" />
      <div className="glow-bg top-[10%] left-[20%] scale-150 opacity-10" />
      <div className="glow-bg top-[60%] right-[10%] scale-110 opacity-[0.05]" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)' }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto flex flex-col items-center gap-16 relative z-10 w-full"
      >
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Live Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-red-950/40 border border-red-500/25 px-4.5 py-1.5 rounded-full text-xs font-medium text-red-400 tracking-wide uppercase mb-8 backdrop-blur-md shadow-lg shadow-red-950/20"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Blood Availability Finder
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.15] mb-6 max-w-3xl"
          >
            Find <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm font-semibold">Lifesaving</span> Blood in Real-Time
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            BloodLink India connects hospitals, emergency crews, and seekers to live blood bank stocks. Powered by public e-RaktKosh integration.
          </motion.p>

          {/* CTA Action Button */}
          <motion.div variants={itemVariants}>
            <Link to="/search">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 35px -10px rgba(239, 68, 68, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-2xl shadow-lg shadow-red-500/20 border border-red-400/25 transition-all cursor-pointer group"
              >
                <Droplet className="w-5 h-5 fill-white/10 group-hover:animate-pulse" />
                <span>Search Live Stock</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>

        </div>

        {/* FEATURES GRID */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          
          <motion.div 
            variants={itemVariants}
            whileHover={{
              y: -8,
              scale: 1.02,
              borderColor: 'rgba(239, 68, 68, 0.35)',
              boxShadow: '0 20px 30px -10px rgba(239, 68, 68, 0.15)'
            }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 text-center flex flex-col items-center cursor-default bg-slate-900/40 relative overflow-hidden border border-white/5"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-transparent opacity-60" />
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Automated Refresh</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Every 4 hours, our background data pipeline pulls and syncs public Indian blood database records.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{
              y: -8,
              scale: 1.02,
              borderColor: 'rgba(59, 130, 246, 0.35)',
              boxShadow: '0 20px 30px -10px rgba(59, 130, 246, 0.15)'
            }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 text-center flex flex-col items-center cursor-default bg-slate-900/40 relative overflow-hidden border border-white/5"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-transparent opacity-60" />
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Heart className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nationwide Search</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              Query blood stocks across all Indian states and districts instantly with clean, simple search filters.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{
              y: -8,
              scale: 1.02,
              borderColor: 'rgba(16, 185, 129, 0.35)',
              boxShadow: '0 20px 30px -10px rgba(16, 185, 129, 0.15)'
            }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="glass-panel p-8 text-center flex flex-col items-center cursor-default bg-slate-900/40 relative overflow-hidden border border-white/5"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-transparent opacity-60" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Zero Mocking</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              100% verified records strictly from the Ministry of Health and Family Welfare database. No dummy entries.
            </p>
          </motion.div>

        </motion.div>

      </motion.div>
    </div>
  );
};

export default LandingPage;
