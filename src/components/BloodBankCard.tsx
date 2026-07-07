import { useState } from 'react';
import { type BloodCentre } from '../hooks/useBloodData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  centre: BloodCentre;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export default function BloodBankCard({ centre }: Props) {
  const [showAddress, setShowAddress] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter only groups with stock
  const availableStock = BLOOD_GROUPS.map(group => ({
    group,
    count: centre[group as keyof BloodCentre] as number | undefined
  })).filter(s => s.count !== undefined && s.count > 0);

  // Clean contact number (take first 10 digits if multiple)
  const primaryContact = centre.contact && centre.contact !== '-' 
    ? centre.contact.split(',')[0].trim() 
    : '';

  const handleCopyAddress = () => {
    if (centre.address) {
      navigator.clipboard.writeText(centre.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      layout
      whileHover={{ 
        y: -6, 
        borderColor: 'rgba(239, 68, 68, 0.25)',
        boxShadow: '0 20px 40px -15px rgba(239, 68, 68, 0.12)'
      }}
      className="glass-panel p-6 flex flex-col h-full bg-slate-900/40 relative overflow-hidden border border-white/5 transition-colors duration-300 group"
    >
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-red-500/50 via-rose-500/10 to-transparent" />
      
      {/* Header Section */}
      <div className="mb-5 flex-grow relative z-10">
        
        {/* Name */}
        <h3 className="text-base font-medium text-white leading-snug mb-2 group-hover:text-red-400 transition-colors">
          {centre.name}
        </h3>
        
        {/* District & State */}
        <div className="flex items-start text-slate-400 text-xs font-normal mb-5 gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{centre.district}, {centre.state}</span>
        </div>

        {/* Blood Stock Badges */}
        {availableStock.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {availableStock.map(({ group, count }) => (
              <motion.div 
                key={group} 
                whileHover={{ scale: 1.08 }}
                className="flex items-center px-3 py-1.5 bg-red-500/10 text-red-300 rounded-xl text-xs font-medium border border-red-500/20 shadow-sm transition-colors hover:bg-red-500/15"
              >
                <span className="mr-1.5 opacity-80 font-normal">{group}</span>
                <span className="bg-red-500/20 text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold">{count}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic bg-slate-950/30 inline-block px-3 py-1.5 rounded-xl border border-white/5">
            No stock reported
          </div>
        )}
      </div>

      {/* Footer / Actions Section */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2.5 relative z-10">
        
        {/* Address Expandable Panel */}
        <AnimatePresence>
          {showAddress && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden mb-2"
            >
              <div className="text-xs text-slate-350 bg-slate-950/40 p-3 rounded-xl border border-white/5 leading-relaxed flex flex-col gap-2 relative">
                <span>{centre.address || 'Address not provided'}</span>
                {centre.address && (
                  <button 
                    onClick={handleCopyAddress}
                    className="self-end flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors mt-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Buttons */}
        <div className="flex gap-2">
          {primaryContact ? (
            <motion.a 
              href={`tel:${primaryContact.replace(/[^0-9+]/g, '')}`} 
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 8px 20px -8px rgba(239, 68, 68, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              className="flex-[2.2] flex items-center justify-center py-2.5 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-red-950/20 border border-red-400/20 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 mr-2" />
              Call Facility
            </motion.a>
          ) : (
            <div className="flex-[2.2] flex items-center justify-center py-2.5 px-4 bg-slate-900/60 text-slate-500 text-xs font-medium rounded-xl cursor-not-allowed border border-white/5">
              Contact Unavailable
            </div>
          )}
          
          <motion.button 
            onClick={() => setShowAddress(!showAddress)}
            whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center py-2.5 px-3 bg-white/3 hover:bg-white/5 text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            {showAddress ? (
              <>
                Hide <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400" />
              </>
            ) : (
              <>
                Details <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
