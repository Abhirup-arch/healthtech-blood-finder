import React from 'react';
import { MapPin, Phone, Droplet } from 'lucide-react';
import './BloodBankCard.css';

interface BloodBankProps {
  name: string;
  units: number;
  address: string;
  contact: string;
  bloodGroup: string;
}

const BloodBankCard: React.FC<BloodBankProps> = ({ name, units, address, contact, bloodGroup }) => {
  const isLowStock = units < 5;

  return (
    <div className="blood-bank-card glass-panel">
      <div className="card-header">
        <h3 className="bank-name">{name}</h3>
        <div className={`stock-badge ${isLowStock ? 'low-stock' : 'good-stock'}`}>
          <Droplet size={14} />
          <span>{units} Units</span>
        </div>
      </div>
      
      <div className="card-body">
        <div className="info-row">
          <MapPin size={16} className="info-icon" />
          <span>{address}</span>
        </div>
        <div className="info-row">
          <Phone size={16} className="info-icon" />
          <span>{contact}</span>
        </div>
      </div>
      
      <div className="card-footer">
        <span className="blood-group-label">Blood Group:</span>
        <span className="blood-group-value">{bloodGroup}</span>
      </div>
    </div>
  );
};

export default BloodBankCard;
