import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Generate static timestamp on mount so it matches the data fetch
    setLastUpdated(new Date().toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }));
  }, []);

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-auto w-full text-sm text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-col text-center md:text-left gap-1">
          <p>
            <strong>Data Source:</strong> e-RaktKosh (Ministry of Health & Family Welfare, Government of India)
          </p>
          <p>
            <strong>Refresh Frequency:</strong> Every 4 Hours
          </p>
          <p>
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <Link 
            to="/methodology" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            How the Data is Collected
          </Link>
          <p className="text-xs text-slate-400 mt-2">
            &copy; {new Date().getFullYear()} BloodLink India
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
