import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, ShieldCheck, Zap } from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="hero-content">
        <div className="hero-text glass-panel">
          <div className="badge">
            <span className="live-dot"></span> Live Blood Stock Updates
          </div>
          <h1 className="hero-title">
            Find <span className="highlight">Lifesaving</span> Blood in Seconds
          </h1>
          <p className="hero-subtitle">
            BloodLink India connects you to blood banks across the country with real-time stock updates. Because every second counts.
          </p>
          <Link to="/search">
            <button className="btn-primary flex items-center gap-2">
              <Droplet size={20} />
              Find Blood Now
            </button>
          </Link>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Zap className="feature-icon" color="#ff4757" />
            <h3>Real-Time</h3>
            <p>Data synced automatically every 4 hours.</p>
          </div>
          <div className="feature-card glass-panel">
            <Heart className="feature-icon" color="#ff4757" />
            <h3>All India</h3>
            <p>Comprehensive database of blood banks.</p>
          </div>
          <div className="feature-card glass-panel">
            <ShieldCheck className="feature-icon" color="#ff4757" />
            <h3>Secure</h3>
            <p>Verified data backed by reliable sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
