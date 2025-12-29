import React, { useState, useEffect } from 'react';
import { Library as LibraryIcon, Search, Book, Bookmark, User, Plus, Loader2, Inbox } from 'lucide-react';
import api from '../services/api';

const Library: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/library/books');
        setBooks(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load books", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">School Library</h2>
          <p className="text-sm text-gray-500 font-medium">Manage book inventory and student rentals</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all">
            <Bookmark size={18} /> Issued Books
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
            <Plus size={18} /> Add New Book
          </button>
        </div>
      </div>

      <div className="card-premium p-6 flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 ring-brand-primary/10" 
          />
        </div>
        <select className="bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-500 outline-none">
          <option>All Categories</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="card-premium p-6 hover:border-brand-primary/20 border border-transparent transition-all group">
              <div className="w-12 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                <Book size={32} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{book.title}</h3>
              <p className="text-xs font-medium text-gray-500 mb-4 italic">by {book.author}</p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">{book.category_name || book.category}</span>
                <span className={`text-[9px] font-black uppercase ${
                  book.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                }`}>{book.available_copies > 0 ? 'Available' : 'Out of Stock'}</span>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">{book.available_copies || 0} Copies Left</span>
                <button className="p-2 text-brand-primary hover:bg-blue-50 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4">
           <Inbox size={48} strokeWidth={1} />
           <p className="font-bold">No books found in the library directory.</p>
        </div>
      )}
    </div>
  );
};

export default Library;