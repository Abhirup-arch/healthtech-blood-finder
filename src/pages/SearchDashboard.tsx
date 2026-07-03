import { useState, useMemo } from 'react';
import BloodBankCard from '../components/BloodBankCard';
import { useBloodData } from '../hooks/useBloodData';
import { useAuth } from '../context/AuthContext';

export default function SearchDashboard() {
  const { data, loading, error } = useBloodData();
  const { user } = useAuth();
  
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(centre => {
      const matchState = stateFilter ? centre.state === stateFilter : true;
      const matchCity = cityFilter ? centre.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const matchQuery = searchQuery 
        ? centre.bloodCentreName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          centre.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      return matchState && matchCity && matchQuery;
    });
  }, [data, stateFilter, cityFilter, searchQuery]);

  // Extract unique states for dropdown
  const states = useMemo(() => {
    const unique = new Set(data.map(d => d.state).filter(Boolean));
    return Array.from(unique).sort();
  }, [data]);

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
    <div className="animate-fade-in p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">IRCS Blood Centre Directory</h1>
        <p className="text-gray-400">Welcome, {user?.displayName}. Search the official Indian Red Cross directory.</p>
      </div>

      {/* Search Controls */}
      <div className="glass-panel p-6 rounded-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
            <select 
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City / District</label>
            <input 
              type="text"
              placeholder="e.g. Mumbai"
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Name</label>
            <input 
              type="text"
              placeholder="Search by centre name..."
              className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map(centre => (
            <BloodBankCard key={centre.id} centre={centre} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400 glass-panel rounded-xl">
            No blood centres found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
