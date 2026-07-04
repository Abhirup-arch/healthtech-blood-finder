import { useState } from 'react';
import { type BloodCentre } from '../hooks/useBloodData';

interface Props {
  centre: BloodCentre;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export default function BloodBankCard({ centre }: Props) {
  const [showAddress, setShowAddress] = useState(false);

  // Filter only groups with stock
  const availableStock = BLOOD_GROUPS.map(group => ({
    group,
    count: centre[group as keyof BloodCentre] as number | undefined
  })).filter(s => s.count !== undefined && s.count > 0);

  // Clean contact number (take first 10 digits if multiple)
  const primaryContact = centre.contact && centre.contact !== '-' 
    ? centre.contact.split(',')[0].trim() 
    : '';

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 flex flex-col h-full">
      
      {/* Header Section */}
      <div className="mb-3 flex-grow">
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">{centre.name}</h3>
        
        <div className="flex items-center text-gray-500 text-xs mb-3">
          <svg className="w-3.5 h-3.5 mr-1 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="truncate">{centre.district}, {centre.state}</span>
        </div>

        {/* Blood Stock Chips */}
        {availableStock.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {availableStock.map(({ group, count }) => (
              <div 
                key={group} 
                className="flex items-center px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[11px] font-bold"
              >
                <span className="mr-1 opacity-90">{group}</span>
                <span className="bg-white text-red-600 px-1 rounded shadow-sm border border-red-50 ml-0.5 leading-tight">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic mt-1 bg-gray-50 inline-block px-2 py-1 rounded">
            No stock reported
          </div>
        )}
      </div>

      {/* Footer / Actions Section */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
        {showAddress && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 leading-relaxed">
            {centre.address || 'Address not provided'}
          </div>
        )}
        
        <div className="flex gap-1.5">
          {primaryContact ? (
            <a 
              href={`tel:${primaryContact.replace(/[^0-9+]/g, '')}`} 
              className="flex-1 flex items-center justify-center py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold rounded-md transition-colors duration-200"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Call
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center py-1.5 px-3 bg-gray-100 text-gray-400 text-[13px] font-medium rounded-md cursor-not-allowed border border-gray-200">
              No Number
            </div>
          )}
          
          <button 
            onClick={() => setShowAddress(!showAddress)}
            className="flex-1 py-1.5 px-3 bg-white hover:bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-md border border-gray-200 transition-colors duration-200"
          >
            {showAddress ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
