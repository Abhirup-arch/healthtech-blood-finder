// React import removed due to verbatimModuleSyntax/JSX config
import { useState } from 'react';
import { type BloodCentre } from '../hooks/useBloodData';

interface Props {
  centre: BloodCentre;
}

export default function BloodBankCard({ centre }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel p-5 rounded-2xl animate-fade-in hover:shadow-lg transition-all duration-300 border border-white/5 bg-gradient-to-br from-white/5 to-white/0 flex flex-col h-full">
      {/* Compact Header Section */}
      <div className="flex flex-col mb-4 flex-grow">
        <h3 className="text-lg font-semibold text-white leading-tight mb-2">{centre.bloodCentreName}</h3>
        
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <svg className="w-4 h-4 mr-2 text-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="truncate">{centre.city}, {centre.state}</span>
        </div>

        <div className="flex items-center text-gray-300 text-sm">
          <svg className="w-4 h-4 mr-2 text-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          <span>{centre.phone || 'Phone not provided'}</span>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-2 mb-4' : 'max-h-0 opacity-0 m-0'
        }`}
      >
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
          <div className="text-sm text-gray-300">
            <span className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Full Address</span>
            {centre.address || 'Not provided'}
          </div>

          {(centre.contactPerson || centre.designation) && (
            <div className="text-sm text-gray-300">
              <span className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Contact Person</span>
              {centre.contactPerson || 'N/A'} {centre.designation ? <span className="text-gray-400 italic">({centre.designation})</span> : ''}
            </div>
          )}

          {centre.email && (
            <div className="text-sm text-gray-300">
              <span className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Email Address</span>
              <a href={`mailto:${centre.email}`} className="text-primary hover:underline">{centre.email}</a>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-auto py-2 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors duration-300 flex items-center justify-center border border-white/10"
      >
        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  );
}
