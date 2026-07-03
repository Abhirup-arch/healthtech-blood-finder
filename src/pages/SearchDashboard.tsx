import { useState, useMemo } from 'react';
import BloodBankCard from '../components/BloodBankCard';
import { useBloodData } from '../hooks/useBloodData';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 12;

export default function SearchDashboard() {
  const { data, loading, error } = useBloodData();
  const { user } = useAuth();
  
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique states for dropdown
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
    const unique = new Set(filteredForCities.map(d => d.city).filter(Boolean));
    return Array.from(unique).sort();
  }, [data, stateFilter]);

  // Handle filter changes (reset pagination)
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStateFilter(e.target.value);
    setCityFilter(''); // Reset city when state changes
    setCurrentPage(1);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCityFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(centre => {
      const matchState = stateFilter ? centre.state === stateFilter : true;
      const matchCity = cityFilter ? centre.city === cityFilter : true;
      const matchQuery = searchQuery 
        ? centre.bloodCentreName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          centre.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      return matchState && matchCity && matchQuery;
    });
  }, [data, stateFilter, cityFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const showingStart = filteredData.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-8 glass-panel rounded-xl">
        <p className="text-xl font-semibold mb-2">Failed to load directory</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">Blood Centre Directory</h1>
        <p className="text-gray-400 text-lg">Welcome, {user?.displayName}. Search the official Indian Red Cross directory.</p>
      </div>

      {/* Search Controls */}
      <div className="glass-panel p-6 rounded-2xl mb-8 shadow-xl border border-white/5 bg-gradient-to-r from-black/40 to-black/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">State</label>
            <div className="relative">
              <select 
                className="w-full bg-dark/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                value={stateFilter}
                onChange={handleStateChange}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">City / District</label>
            <div className="relative">
              <select 
                className="w-full bg-dark/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer disabled:opacity-50"
                value={cityFilter}
                onChange={handleCityChange}
                disabled={cities.length === 0}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Search Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text"
                placeholder="Search by centre name..."
                className="w-full bg-dark/60 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Directory Listings</h2>
        <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
          Showing {showingStart}-{showingEnd} of {filteredData.length} Centres
        </span>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedData.length > 0 ? (
          paginatedData.map(centre => (
            <BloodBankCard key={centre.id} centre={centre} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 glass-panel rounded-2xl border border-white/5">
            <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg">No blood centres found matching your search criteria.</p>
            <button 
              onClick={() => { setStateFilter(''); setCityFilter(''); setSearchQuery(''); }}
              className="mt-4 text-primary hover:text-white transition-colors underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mb-12">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
}
