import { useState, useMemo, useEffect } from 'react';
import BloodBankCard from '../components/BloodBankCard';
import { useBloodData, type BloodCentre } from '../hooks/useBloodData';
import { motion, AnimatePresence, animate } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, MapPin, Activity, Building2, Clock, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

const ITEMS_PER_PAGE = 18;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

const STATE_ALIASES: Record<string, string> = {
  'nct of delhi': 'delhi',
  'orissa': 'odisha',
  'pondicherry': 'puducherry',
  'jammu and kashmir': 'jammu & kashmir',
  'andaman and nicobar': 'andaman & nicobar islands',
  'daman and diu': 'dadra & nagar haveli',
};

// Simple animated counter component
function AnimatedCounter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (value) => setCount(Math.round(value))
    });
    return () => controls.stop();
  }, [from, to]);

  return <>{count.toLocaleString()}</>;
}

// Framer motion animation variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp: Variants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  }
};

// Premium loading skeleton card
function SkeletonCard() {
  return (
    <div className="glass-panel p-6 flex flex-col h-full bg-slate-900/40 border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5" />
      <div className="h-5 w-2/3 skeleton-premium rounded-lg mb-3" />
      <div className="h-3 w-1/2 skeleton-premium rounded-lg mb-6" />
      <div className="flex gap-2 mb-8">
        <div className="h-7 w-12 skeleton-premium rounded-lg" />
        <div className="h-7 w-12 skeleton-premium rounded-lg" />
        <div className="h-7 w-12 skeleton-premium rounded-lg" />
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="h-10 flex-[2.2] skeleton-premium rounded-xl" />
        <div className="h-10 flex-1 skeleton-premium rounded-xl" />
      </div>
    </div>
  );
}

export default function SearchDashboard() {
  const { data, loading, error } = useBloodData();
  
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | ''>('');
  const [sortBy, setSortBy] = useState('Highest Stock');
  const [currentPage, setCurrentPage] = useState(1);
  const [geoLoading, setGeoLoading] = useState(false);
  const [lastUpdated] = useState(() => new Date().toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }));

  // Helper to calculate total stock for a centre
  const getTotalStock = (centre: BloodCentre) => {
    let total = 0;
    BLOOD_GROUPS.forEach(grp => {
      const val = centre[grp as keyof BloodCentre] as number | undefined;
      if (val) total += val;
    });
    return total;
  };

  const totalBanks = data.length;
  
  const banksWithStock = useMemo(() => {
    return data.filter(c => getTotalStock(c) > 0).length;
  }, [data]);

  const totalUnitsNationwide = useMemo(() => {
    return data.reduce((sum, centre) => sum + getTotalStock(centre), 0);
  }, [data]);

  const states = useMemo(() => {
    const unique = new Set(data.map(d => d.state).filter(Boolean));
    return Array.from(unique).sort();
  }, [data]);

  const cities = useMemo(() => {
    let filteredForCities = data;
    if (stateFilter) {
      filteredForCities = data.filter(d => d.state === stateFilter);
    }
    const unique = new Set(filteredForCities.map(d => d.district).filter(Boolean));
    return Array.from(unique).sort();
  }, [data, stateFilter]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`);
          const geoData = await res.json();
          
          if (geoData && geoData.address) {
            let rawState = (geoData.address.state || '').toLowerCase();
            let rawDistrict = (geoData.address.state_district || geoData.address.city || geoData.address.county || '').toLowerCase();
            
            if (STATE_ALIASES[rawState]) rawState = STATE_ALIASES[rawState];

            const matchedState = states.find(s => rawState.includes(s.toLowerCase()) || s.toLowerCase().includes(rawState));
            if (matchedState) {
              setStateFilter(matchedState);
              setTimeout(() => {
                setCityFilter(rawDistrict.replace(/district/i, '').trim());
              }, 100);
            } else {
              alert("Could not accurately match your Indian State from coordinates.");
            }
          }
        } catch (e) {
          console.error("Geocoding failed", e);
          alert("Failed to reverse-geocode your location.");
        } finally {
          setGeoLoading(false);
          setCurrentPage(1);
        }
      },
      () => {
        alert("Unable to retrieve your location.");
        setGeoLoading(false);
      }
    );
  };

  const resetFilters = () => {
    setStateFilter('');
    setCityFilter('');
    setSearchQuery('');
    setBloodGroupFilter('');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let filtered = data.filter(centre => {
      const matchState = stateFilter ? centre.state === stateFilter : true;
      const matchCity = cityFilter ? (centre.district || '').toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const matchQuery = searchQuery 
        ? centre.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchBloodGroup = bloodGroupFilter 
        ? ((centre[bloodGroupFilter as keyof BloodCentre] as number | undefined) || 0) > 0
        : true;
      
      return matchState && matchCity && matchQuery && matchBloodGroup;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'Name A-Z') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'District') {
        return (a.district || '').localeCompare(b.district || '');
      } else {
        if (bloodGroupFilter) {
          const valA = (a[bloodGroupFilter as keyof BloodCentre] as number | undefined) || 0;
          const valB = (b[bloodGroupFilter as keyof BloodCentre] as number | undefined) || 0;
          return valB - valA;
        } else {
          return getTotalStock(b) - getTotalStock(a);
        }
      }
    });

    return filtered;
  }, [data, stateFilter, cityFilter, searchQuery, bloodGroupFilter, sortBy]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showingStart = filteredData.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);

  // Error State Component
  if (error) {
    return (
      <div className="flex justify-center items-center h-[80vh] px-4 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-red-300 glass-panel p-8 max-w-md text-center bg-red-950/20 border-red-500/20"
        >
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="grid-overlay" />
      
      {/* Dynamic Background Glow Layer */}
      <div className="glow-bg top-[5%] left-[25%] opacity-15" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 mb-4">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-semibold text-red-400 tracking-wider uppercase">Live e-RaktKosh Sync</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
                Blood Stock Search
              </h1>
              <p className="text-slate-400 text-sm max-w-xl font-normal leading-relaxed">
                Find available units in clinical facilities across India. Real-time metrics verify immediate availability.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 bg-slate-900/50 px-4 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Verified Source</p>
                <p className="text-xs text-white font-medium">e-RaktKosh Govt Portal</p>
              </div>
            </div>
          </div>

          {/* Staggered Statistics Cards */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div variants={fadeUp} className="glass-panel p-5 bg-slate-900/40 flex items-center space-x-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Total Units</p>
                <p className="text-xl font-semibold text-white">
                  {loading ? '...' : <AnimatedCounter from={0} to={totalUnitsNationwide} />}
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={fadeUp} className="glass-panel p-5 bg-slate-900/40 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Facilities</p>
                <p className="text-xl font-semibold text-white">
                  {loading ? '...' : <AnimatedCounter from={0} to={totalBanks} />}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-panel p-5 bg-slate-900/40 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">In Stock</p>
                <p className="text-xl font-semibold text-white">
                  {loading ? '...' : <AnimatedCounter from={0} to={banksWithStock} />}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-panel p-5 bg-slate-900/40 flex items-center space-x-4">
              <div className="p-3 bg-slate-500/10 rounded-2xl border border-slate-500/20">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Last Update</p>
                <p className="text-xs font-semibold text-white truncate max-w-[130px]">{lastUpdated}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-4 z-40 bg-slate-950/80 backdrop-blur-xl p-4 rounded-2xl mb-10 shadow-xl border border-white/5 flex flex-col gap-4"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center w-full">
            
            {/* Near Me Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFindNearMe}
              disabled={geoLoading}
              className="w-full lg:w-auto flex-shrink-0 flex items-center justify-center py-2.5 px-5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-red-950/20 border border-red-400/20 disabled:opacity-75 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 mr-2" />
              {geoLoading ? 'Locating...' : 'Near Me'}
            </motion.button>

            <div className="hidden lg:block w-px h-6 bg-white/10"></div>

            {/* Filters Select Grid */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 flex-grow">
              <div>
                <select 
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-normal focus:ring-1 focus:ring-red-500/50 outline-none transition-all cursor-pointer appearance-none"
                  value={bloodGroupFilter}
                  onChange={e => { setBloodGroupFilter(e.target.value as BloodGroup | ''); setCurrentPage(1); }}
                >
                  <option value="">Any Blood Group</option>
                  {BLOOD_GROUPS.map(grp => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-normal focus:ring-1 focus:ring-red-500/50 outline-none transition-all cursor-pointer appearance-none"
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); setCityFilter(''); setCurrentPage(1); }}
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select 
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-normal focus:ring-1 focus:ring-red-500/50 outline-none transition-all cursor-pointer appearance-none disabled:opacity-50"
                  value={cityFilter}
                  onChange={e => { setCityFilter(e.target.value); setCurrentPage(1); }}
                  disabled={cities.length === 0}
                >
                  <option value="">All Districts</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-normal focus:ring-1 focus:ring-red-500/50 outline-none transition-all cursor-pointer appearance-none"
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                >
                  <option value="Highest Stock">Highest Stock First</option>
                  <option value="Name A-Z">Name (A-Z)</option>
                  <option value="District">District Name</option>
                </select>
              </div>
            </div>

            <div className="hidden lg:block w-px h-6 bg-white/10"></div>

            {/* Name Search Box */}
            <div className="w-full lg:w-60 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <input 
                type="text"
                placeholder="Search facility name..."
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-normal placeholder-slate-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

          </div>
        </motion.div>

        {/* RESULTS SUMMARY */}
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-lg font-medium text-white tracking-tight">Search Results</h2>
          <span className="text-xs text-slate-400 font-normal bg-slate-900/40 px-3.5 py-1.5 rounded-full border border-white/5 shadow-sm">
            Showing {showingStart}-{showingEnd} of <span className="text-white font-medium">{filteredData.length}</span>
          </span>
        </div>

        {/* MAIN RESULTS GRID WITH SKELETON OR CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            <AnimatePresence mode="popLayout">
              {paginatedData.length > 0 ? (
                paginatedData.map(centre => (
                  <motion.div
                    key={centre.id}
                    variants={fadeUp}
                    layout
                  >
                    <BloodBankCard centre={centre} />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10"
                >
                  <Search className="w-10 h-10 mb-4 text-slate-500" />
                  <p className="text-base font-medium text-white mb-1">No facilities matched your filters</p>
                  <p className="text-xs text-slate-400 max-w-xs text-center mb-4">Try widening your search state or choosing any blood group.</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-white/5 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Search Filters
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pb-16">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </motion.button>
            
            <div className="flex space-x-1.5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all border ${
                      currentPage === pageNum 
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500/30' 
                        : 'bg-slate-900/40 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
