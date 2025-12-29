import { useState, useEffect, useCallback } from 'react';

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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFn({ page, search, filters });
      
      let extractedData: T[] = [];
      let meta: any = null;

      // Case 1: Result is the standardized envelope { data: { data: [] } }
      if (result?.data && Array.isArray(result.data.data)) {
        extractedData = result.data.data;
        meta = result.data.meta || result.meta;
      } 
      // Case 2: Result is { data: [] }
      else if (Array.isArray(result?.data)) {
        extractedData = result.data;
        meta = result.meta;
      }
      // Case 3: Result is the array itself
      else if (Array.isArray(result)) {
        extractedData = result as unknown as T[];
      }
      // Case 4: Deep nesting or direct data property
      else if (result && (result as any).data && Array.isArray((result as any).data)) {
        extractedData = (result as any).data;
        meta = (result as any).meta;
      }

      // Final fallback to prevent .map issues
      setData(Array.isArray(extractedData) ? extractedData : []);

      if (meta) {
        setTotal(meta.total || extractedData.length);
        setLastPage(meta.last_page || 1);
      } else {
        setTotal(extractedData.length);
        setLastPage(1);
      }
    } catch (error) {
      console.warn("Table data processing failed, defaulting to empty array:", error);
      setData([]);
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