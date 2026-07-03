import { useState, useEffect } from 'react';

export interface BloodBank {
  id: string;
  name: string;
  state: string;
  district: string;
  units: number;
  address: string;
  contact: string;
  bloodGroup: string;
}

export const useBloodData = () => {
  const [data, setData] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appending timestamp to avoid caching during development/updates
        const response = await fetch(`/data/blood_stock.json?t=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
