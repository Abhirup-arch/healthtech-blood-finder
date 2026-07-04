import { useState, useMemo } from 'react';
import BloodBankCard from '../components/BloodBankCard';
import { useBloodData, type BloodCentre } from '../hooks/useBloodData';
import { Search, MapPin, Activity, Building2, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ITEMS_PER_PAGE = 20;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

// State aliases for robust geolocation reverse-geocoding mapping
const STATE_ALIASES: Record<string, string> = {
  'nct of delhi': 'delhi',
  'orissa': 'odisha',
  'pondicherry': 'puducherry',
  'jammu and kashmir': 'jammu & kashmir',
  'andaman and nicobar': 'andaman & nicobar islands',
  'daman and diu': 'dadra & nagar haveli',
};

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

  // Computed Stats for Hero
  const totalBanks = data.length;
  
  const banksWithStock = useMemo(() => {
    return data.filter(c => getTotalStock(c) > 0).length;
  }, [data]);

  const totalUnitsNationwide = useMemo(() => {
    return data.reduce((sum, centre) => sum + getTotalStock(centre), 0);
  }, [data]);

  // Extract unique states
  const states = useMemo(() => {
    const unique = new Set(data.map(d => d.state).filter(Boolean));
    return Array.from(unique).sort();
  }, [data]);

  // Extract unique cities based on selected state
  const cities = useMemo(() => {
    let filteredForCities = data;
    if (stateFilter) {
      filteredForCities = data.filter(d => d.state === stateFilter);
    }
    const unique = new Set(filteredForCities.map(d => d.district).filter(Boolean));
    return Array.from(unique).sort();
  }, [data, stateFilter]);

  // Geolocation Handler
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
            
            // Apply aliases
            if (STATE_ALIASES[rawState]) rawState = STATE_ALIASES[rawState];

            const matchedState = states.find(s => rawState.includes(s.toLowerCase()) || s.toLowerCase().includes(rawState));
            if (matchedState) {
              setStateFilter(matchedState);
              // Small delay to allow cities to compute
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

  // Filter & Sort Data
  const filteredData = useMemo(() => {
    let filtered = data.filter(centre => {
      const matchState = stateFilter ? centre.state === stateFilter : true;
      const matchCity = cityFilter ? (centre.district || '').toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const matchQuery = searchQuery 
        ? centre.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchBloodGroup = bloodGroupFilter 
        ? (centre[bloodGroupFilter as keyof BloodCentre] as number | undefined) || 0 > 0
        : true;
      
      return matchState && matchCity && matchQuery && matchBloodGroup;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'Name A-Z') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'District') {
        return (a.district || '').localeCompare(b.district || '');
      } else { // Highest Stock
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showingStart = filteredData.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mb-4"></div>
        <p className="text-slate-600 font-semibold">Connecting to e-RaktKosh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-red-700 bg-white p-8 rounded-2xl border border-red-100 max-w-md text-center shadow-lg">
          <Activity className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      
      {/* PREMIUM HERO SECTION */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-4">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-red-700 tracking-wide uppercase">Live Updates Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight flex items-center">
                BloodLink India
              </h1>
              <p className="text-slate-500 mt-2 text-base md:text-lg max-w-2xl">
                Real-time national blood availability network, synchronized directly with government e-RaktKosh data.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Verified Source</p>
                <p className="text-sm text-slate-900 font-medium">e-RaktKosh API</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Units</p>
                <p className="text-2xl font-semibold text-slate-900">{totalUnitsNationwide.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Facilities</p>
                <p className="text-2xl font-semibold text-slate-900">{totalBanks.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">In Stock</p>
                <p className="text-2xl font-semibold text-slate-900">{banksWithStock.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Last Update</p>
                <p className="text-sm font-semibold text-slate-900">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MODERN SEARCH TOOLBAR */}
        <div className="sticky top-4 z-40 bg-white/95 backdrop-blur-xl p-4 rounded-2xl mb-8 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Find Near Me Button - Highlighted */}
            <button 
              onClick={handleFindNearMe}
              disabled={geoLoading}
              className="w-full lg:w-auto flex-shrink-0 flex items-center justify-center py-2.5 px-5 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {geoLoading ? 'Locating...' : 'Near Me'}
            </button>

            <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

            {/* Filters Grid */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 flex-grow">
              
              <div>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                >
                  <option value="Highest Stock">Sort: Highest Stock</option>
                  <option value="Name A-Z">Sort: Name (A-Z)</option>
                  <option value="District">Sort: District</option>
                </select>
              </div>
            </div>

            <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

            {/* Search Input */}
            <div className="w-full lg:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text"
                placeholder="Search facility name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder-slate-400"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
          <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Showing {showingStart}-{showingEnd} of <span className="font-medium text-slate-900">{filteredData.length}</span>
          </span>
        </div>

        {/* Results Grid - 1 Col Mobile, 2 Col Tablet, 3 Col Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {paginatedData.length > 0 ? (
            paginatedData.map(centre => (
              <BloodBankCard key={centre.id} centre={centre} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Search className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">No facilities found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={resetFilters}
                className="mt-4 px-5 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Premium Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pb-12">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="flex space-x-1.5">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                      currentPage === pageNum 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
