
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 mb-4 px-2 overflow-x-auto no-scrollbar whitespace-nowrap">
      <Link to="/" className="text-gray-400 hover:text-brand-primary transition-colors">
        <Home size={14} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-gray-300" />
            {isLast ? (
              <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{displayName}</span>
            ) : (
              <Link to={routeTo} className="text-xs font-bold text-gray-400 hover:text-brand-primary transition-colors capitalize">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
