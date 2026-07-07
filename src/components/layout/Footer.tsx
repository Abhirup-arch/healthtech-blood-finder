import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Mail, AlertCircle, FileText } from 'lucide-react';

const Footer: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }));
  }, []);

  return (
    <footer className="bg-slate-955 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-auto w-full relative z-10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Transparency Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center text-white font-medium text-sm gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span>Data Transparency</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Data Source:</strong> e-RaktKosh (Ministry of Health & Family Welfare, Government of India).
          </p>
          <p className="text-xs text-slate-400">
            <strong>Refresh Frequency:</strong> Every 4 Hours
          </p>
          <div className="flex items-center text-xs text-slate-500 gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Synced: {lastUpdated}</span>
          </div>
        </div>

        {/* Navigation & Help Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center text-white font-medium text-sm gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Methodology & Code</span>
          </div>
          <Link 
            to="/methodology" 
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors w-fit"
          >
            How the Data is Collected
          </Link>
          <a 
            href="https://github.com/Abhirup-arch/healthtech-blood-finder" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors w-fit"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub Repository
          </a>
          <a 
            href="mailto:support@bloodlink.org" 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors w-fit"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Support
          </a>
        </div>

        {/* Disclaimer Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center text-white font-medium text-sm gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>Emergency Disclaimer</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            BloodLink India is an informational directory service. We do not manufacture or guarantee stock. Please call the clinical facility directly to verify availability before making emergency transit.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-normal">
        <p>&copy; {new Date().getFullYear()} BloodLink India. Serving emergency healthcare seekers.</p>
        <div className="flex gap-4">
          <Link to="/methodology" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/methodology" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
