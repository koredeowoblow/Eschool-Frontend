import { useState, useEffect, useCallback } from 'react';

interface FetchParams {
  page: number;
  search: string;
  per_page?: number;
  filters?: Record<string, any>;
}

interface ApiResponse<T> {
  data: any; // Can be array or object with data property
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFn({ page, search, filters });
      
      // Standardize data extraction from Laravel Resource/Pagination envelopes
      let extractedData = [];
      if (Array.isArray(result.data)) {
        extractedData = result.data;
      } else if (result.data && Array.isArray(result.data.data)) {
        extractedData = result.data.data;
      } else if (result && Array.isArray((result as any).data)) {
        extractedData = (result as any).data;
      }

      setData(extractedData);

      // Extract metadata
      const meta = result.meta || (result as any).data?.meta || result;
      if (meta && typeof meta === 'object') {
        setTotal(meta.total || extractedData.length);
        setLastPage(meta.last_page || 1);
      }
    } catch (error) {
      console.warn("Table data fetch failed:", error);
      setData([]); // Fallback to empty array on error
    } finally {
      setIsLoading(false);
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