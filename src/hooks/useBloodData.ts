import { useState, useEffect } from 'react';

export interface BloodCentre {
  id: string;
  name: string;
  district: string;
  state: string;
  contact?: string;
  address?: string;
  'A+'?: number;
  'A-'?: number;
  'B+'?: number;
  'B-'?: number;
  'O+'?: number;
  'O-'?: number;
  'AB+'?: number;
  'AB-'?: number;
}

// Helper to convert "andhra pradesh" to "Andhra Pradesh"
function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function useBloodData() {
  const [data, setData] = useState<BloodCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/data/blood_availability.json?t=${Date.now()}`;
        console.log(`[BloodData] Fetching from: ${url}`);
        
        const response = await fetch(url);
        
        console.log(`[BloodData] Response Status: ${response.status} ${response.statusText}`);
        const contentType = response.headers.get('content-type');
        console.log(`[BloodData] Content-Type: ${contentType}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          console.error(`[BloodData] Received HTML instead of JSON:`, text.substring(0, 100));
          throw new Error('Server returned HTML instead of JSON. The data file might be missing or the routing is misconfigured.');
        }

        const rawJson: Record<string, any[]> = await response.json();
        
        // Flatten the state-keyed object into a single array
        const flattenedData: BloodCentre[] = [];
        let idCounter = 1;
        
        for (const [stateKey, centres] of Object.entries(rawJson)) {
          const formattedState = toTitleCase(stateKey);
          for (const centre of centres) {
            flattenedData.push({
              id: `centre-${idCounter++}`,
              state: formattedState,
              ...centre
            });
          }
        }
        
        setData(flattenedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
