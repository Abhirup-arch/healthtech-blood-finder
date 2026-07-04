import { useState, useMemo } from 'react';
import BloodBankCard from '../components/BloodBankCard';
import { useBloodData, type BloodCentre } from '../hooks/useBloodData';

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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-red-600 mb-3"></div>
        <p className="text-gray-600 font-medium text-sm">Connecting to e-RaktKosh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-700 bg-red-50 p-5 rounded-lg border border-red-200 max-w-sm text-center shadow-sm">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p className="text-base font-bold">Connection Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
                <span className="text-red-600 mr-2 text-xl">●</span> BloodLink India
              </h1>
              <p className="text-gray-500 mt-0.5 text-sm font-medium">Real-Time Blood Availability Finder</p>
            </div>
            <div className="mt-3 md:mt-0 flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <div>
                <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider leading-none">Govt Data Source</p>
                <p className="text-xs text-blue-900 font-medium leading-tight">Synced with e-RaktKosh</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards (Compact) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total Nationwide Units</p>
              <p className="text-xl font-black text-red-600">{totalUnitsNationwide.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Total Facilities</p>
              <p className="text-xl font-black text-gray-900">{totalBanks.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Facilities w/ Stock</p>
              <p className="text-xl font-black text-gray-900">{banksWithStock.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Last Updated</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{lastUpdated}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
              <button 
                onClick={handleFindNearMe}
                disabled={geoLoading}
                className="w-full flex items-center justify-center py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-sm rounded-md transition-colors"
              >
                {geoLoading ? 'Locating...' : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Find Near Me
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* COMPACT STICKY SEARCH PANEL (30% Reduced Size) */}
        <div className="sticky top-2 z-40 bg-white/90 backdrop-blur-md p-3 rounded-xl mb-6 shadow-sm border border-gray-200/60">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Blood Group</label>
              <select 
                className="w-full bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 text-sm text-red-900 font-bold focus:ring-1 focus:ring-red-500 outline-none"
                value={bloodGroupFilter}
                onChange={e => { setBloodGroupFilter(e.target.value as BloodGroup | ''); setCurrentPage(1); }}
              >
                <option value="">Any Group</option>
                {BLOOD_GROUPS.map(grp => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">State</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-gray-300 outline-none"
                value={stateFilter}
                onChange={e => { setStateFilter(e.target.value); setCityFilter(''); setCurrentPage(1); }}
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">District</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-gray-300 outline-none disabled:bg-gray-100 disabled:text-gray-400"
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

            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Sort By</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-gray-300 outline-none"
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
              >
                <option value="Highest Stock">Highest Stock</option>
                <option value="Name A-Z">Name (A-Z)</option>
                <option value="District">District</option>
              </select>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Search</label>
              <input 
                type="text"
                placeholder="Hospital name..."
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-gray-300 outline-none"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-end mb-4 px-1 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-bold text-gray-800">Search Results</h2>
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
            Showing {showingStart}-{showingEnd} of {filteredData.length}
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {paginatedData.length > 0 ? (
            paginatedData.map(centre => (
              <BloodBankCard key={centre.id} centre={centre} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-base font-semibold text-gray-700">No facilities found</p>
              <p className="text-sm text-gray-500 mt-0.5">Try adjusting your filters.</p>
              <button 
                onClick={resetFilters}
                className="mt-3 px-4 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded hover:bg-red-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-1.5 pb-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="flex space-x-1">
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
                    className={`w-8 h-8 rounded-md text-sm font-bold transition-all shadow-sm border ${
                      currentPage === pageNum 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
              className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
