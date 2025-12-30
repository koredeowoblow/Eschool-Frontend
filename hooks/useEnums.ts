
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useEnums() {
  const [enums, setEnums] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await api.get('/settings/enums');
        setEnums(res.data.data || res.data || {});
      } catch (err) {
        console.error("Failed to load system enums", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnums();
  }, []);

  return { enums, isLoading };
}
