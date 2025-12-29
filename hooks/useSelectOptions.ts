
import { useState, useEffect } from 'react';
import api from '../services/api';

interface Option {
  value: string | number;
  label: string;
}

export function useSelectOptions(endpoint: string, labelKey: string = 'name') {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(endpoint);
        // Standard Laravel resource mapping (handle .data.data or .data)
        const rawData = response.data.data || response.data;
        
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((item: any) => ({
            value: item.id,
            label: item[labelKey] || item.title || item.name || 'Unknown'
          }));
          setOptions(mapped);
        } else {
          setOptions([]);
        }
      } catch (err) {
        setError('Failed to load options');
        console.error(`Error loading options for ${endpoint}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [endpoint, labelKey]);

  return { options, isLoading, error };
}
