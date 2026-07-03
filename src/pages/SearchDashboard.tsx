import React, { useState, useMemo } from 'react';
import BloodBankCard from '../components/common/BloodBankCard';
import { useBloodData } from '../hooks/useBloodData';
import './SearchDashboard.css';

const SearchDashboard: React.FC = () => {
  const { data, loading, error } = useBloodData();
  
  const [bloodGroup, setBloodGroup] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  
  const filteredData = useMemo(() => {
    return data.filter(bank => {
      const matchState = state ? bank.state === state : true;
      const matchDistrict = district ? bank.district === district : true;
      const matchGroup = bloodGroup ? bank.bloodGroup === bloodGroup : true;
      return matchState && matchDistrict && matchGroup;
    });
  }, [data, state, district, bloodGroup]);
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header glass-panel">
        <h2>Find Blood Availability</h2>
        <p>Real-time data from registered blood banks.</p>
        
        <div className="search-filters">
          <select className="glass-select" value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }}>
            <option value="">All States</option>
            <option value="MH">Maharashtra</option>
            <option value="DL">Delhi</option>
            <option value="KA">Karnataka</option>
          </select>
          
          <select className="glass-select" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
            <option value="">All Districts</option>
            {state === 'MH' && (
              <>
                <option value="MUM">Mumbai</option>
                <option value="PUN">Pune</option>
              </>
            )}
            {state === 'DL' && <option value="NDL">New Delhi</option>}
            {state === 'KA' && <option value="BLR">Bangalore</option>}
          </select>
          
          <select className="glass-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>
      
      <div className="results-container">
        <h3>Available Blood Banks ({filteredData.length})</h3>
        
        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading data...</p>}
        {error && <p style={{ color: 'var(--primary-color)' }}>Error: {error}</p>}
        
        {!loading && !error && (
          <div className="results-grid">
            {filteredData.length > 0 ? (
              filteredData.map((bank) => (
                <BloodBankCard 
                  key={bank.id}
                  name={bank.name}
                  units={bank.units}
                  address={bank.address}
                  contact={bank.contact}
                  bloodGroup={bank.bloodGroup}
                />
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                No blood banks found matching your criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDashboard;
