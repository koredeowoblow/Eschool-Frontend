
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300 mb-8">
        <Search size={48} />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">404 - Area Restricted</h1>
      <p className="text-gray-500 font-medium max-w-md mb-10 leading-relaxed">
        The academic resource you are looking for has been moved or archived. Please check your URL and try again.
      </p>
      <div className="flex gap-4">
        <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all">
          <ArrowLeft size={18} /> Go Back
        </button>
        <Link to="/" className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Home size={18} /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
