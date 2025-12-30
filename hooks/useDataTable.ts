
import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchParams {
  page: number;
  search: string;
  per_page?: number;
  filters?: Record<string, any>;
}

interface ApiResponse<T> {
  data: any;
  meta?: any;
}

export function useDataTable<T>(fetchFn: (params: FetchParams) => Promise<ApiResponse<T>>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Use ref to track active request and prevent race conditions
  const requestCountRef = useRef(0);

  const loadData = useCallback(async () => {
    const currentRequestId = ++requestCountRef.current;
    setIsLoading(true);
    
    try {
      const result = await fetchFn({ page, search, filters });
      
      // If a newer request has started, ignore this result
      if (currentRequestId !== requestCountRef.current) return;

      let extractedData: T[] = [];
      let meta: any = null;

      // Handle varied Laravel Response Shapes
      if (result) {
        if (result.data && Array.isArray(result.data.data)) {
          extractedData = result.data.data;
          meta = result.data.meta || result.data;
        } else if (Array.isArray(result.data)) {
          extractedData = result.data;
          meta = result.meta;
        } else if (Array.isArray(result)) {
          extractedData = result as unknown as T[];
        } else if ((result as any).data && Array.isArray((result as any).data)) {
          extractedData = (result as any).data;
        }
      }

      setData(Array.isArray(extractedData) ? extractedData : []);

      if (meta && typeof meta === 'object') {
        setTotal(meta.total ?? extractedData.length);
        setLastPage(meta.last_page ?? 1);
      } else {
        setTotal(extractedData.length);
        setLastPage(1);
      }
    } catch (error) {
      if (currentRequestId === requestCountRef.current) {
        console.warn("Table data processing failed, defaulting to empty array:", error);
        setData([]);
      }
    } finally {
      if (currentRequestId === requestCountRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, search, JSON.stringify(filters), fetchFn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    total,
    lastPage,
    isLoading,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    refresh: loadData
  };
}
