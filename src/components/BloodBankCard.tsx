import { useState } from 'react';
import { type BloodCentre } from '../hooks/useBloodData';
import { MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 flex flex-col h-full group">
      
      {/* Header Section */}
      <div className="mb-4 flex-grow">
        <h3 className="text-lg font-medium text-slate-900 leading-tight mb-1.5 group-hover:text-red-700 transition-colors">
          {centre.name}
        </h3>
        
        <div className="flex items-start text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{centre.district}, {centre.state}</span>
        </div>

        {/* Blood Stock Pill Badges */}
        {availableStock.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableStock.map(({ group, count }) => (
              <div 
                key={group} 
                className="flex items-center px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100 shadow-sm"
              >
                <span className="mr-1.5 opacity-80">{group}</span>
                <span className="bg-white text-red-700 px-1.5 rounded-full shadow-sm text-[11px]">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic bg-slate-50 inline-block px-3 py-1.5 rounded-md border border-slate-100">
            No stock reported at this time
          </div>
        )}
      </div>

      {/* Footer / Actions Section */}
      <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-2">
        {showAddress && (
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed animate-fade-in mb-2">
            {centre.address || 'Address not provided'}
          </div>
        )}
        
        <div className="flex gap-2">
          {primaryContact ? (
            <a 
              href={`tel:${primaryContact.replace(/[^0-9+]/g, '')}`} 
              className="flex-[2] flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Facility
            </a>
          ) : (
            <div className="flex-[2] flex items-center justify-center py-2 px-4 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed border border-slate-200">
              No Number
            </div>
          )}
          
          <button 
            onClick={() => setShowAddress(!showAddress)}
            className="flex-1 flex items-center justify-center py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl border border-slate-200 transition-colors shadow-sm"
          >
            {showAddress ? (
              <>
                Hide <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />
              </>
            ) : (
              <>
                Details <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
