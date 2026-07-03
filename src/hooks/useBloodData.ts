import { useState, useEffect } from 'react';

export interface BloodCentre {
  id: string;
  state: string;
  city: string;
  bloodCentreName: string;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  source: string;
}

export function useBloodData() {
  const [data, setData] = useState<BloodCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/blood_centres.json');
        if (!response.ok) {
          throw new Error('Failed to fetch blood centre data');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
