import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center text-slate-700 font-semibold mb-2">
            <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
            Data Source & Methodology
          </div>
          <p className="text-sm text-slate-500 mb-1">
            Data sourced from <span className="font-medium text-slate-700">e-RaktKosh</span> (Ministry of Health & Family Welfare, Govt of India).
          </p>
          <div className="flex items-center text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Refreshed automatically every 4 hours via GitHub Actions.</span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <Link 
            to="/methodology" 
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            How the data is collected <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} BloodLink India. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
