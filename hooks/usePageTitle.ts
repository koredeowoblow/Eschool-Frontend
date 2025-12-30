
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const base = "eSchool Premium";
    
    if (path === '/') {
      document.title = `Dashboard | ${base}`;
    } else {
      const parts = path.split('/').filter(x => x);
      const page = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace(/-/g, ' ');
      document.title = `${page} | ${base}`;
    }
  }, [location.pathname]);
}
