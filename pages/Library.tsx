
import React, { useState, useEffect } from 'react';
import { Library as LibraryIcon, Search, Book, Bookmark, User, Plus, Loader2, Inbox, History, RotateCcw, Save } from 'lucide-react';
import api from '../services/api';
import { useDataTable } from '../hooks/useDataTable';
import { DataTable } from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useSelectOptions } from '../hooks/useSelectOptions';
import { useFormSubmit } from '../hooks/useFormSubmit';

const Library: React.FC = () => {
  const [activeView, setActiveView] = useState<'inventory' | 'borrowings'>('inventory');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  const { options: studentOptions } = useSelectOptions('/students');
  const { options: bookOptions } = useSelectOptions('/library/books', 'title');

  const fetchBooks = async (params: any) => {
    const res = await api.get('/library/books', { params });
    return res.data;
  };

  const fetchBorrowings = async (params: any) => {
    const res = await api.get('/library/borrowings', { params });
    return res.data;
  };

  const inventoryTable = useDataTable(fetchBooks);
  const borrowingsTable = useDataTable(fetchBorrowings);

  const [issueData, setIssueData] = useState({ student_id: '', book_id: '', due_date: '' });
  const { submit: submitIssue, isSubmitting: isIssuing } = useFormSubmit(
    (data) => api.post('/library/borrowings', data),
    {
      onSuccess: () => {
        setIsIssueModalOpen(false);
        borrowingsTable.refresh();
        inventoryTable.refresh();
      }
    }
  );

  const handleReturn = async (id: string) => {
    if (!window.confirm("Confirm book return?")) return;
    try {
      await api.patch(`/library/borrowings/${id}/return`); // PATCH api/v1/library/borrowings/{id}/return
      borrowingsTable.refresh();
      inventoryTable.refresh();
    } catch (err) {
      console.error("Return failed", err);
    }
  };

  const inventoryColumns = [
    { 
      header: 'Literary Title', 
      key: 'title',
      render: (b: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-12 bg-blue-50 text-brand-primary rounded-lg flex items-center justify-center border border-blue-100"><Book size={18} /></div>
          <div>
            <p className="font-bold text-gray-800 line-clamp-1">{b.title}</p>
            <p className="text-[10px] text-gray-400 font-bold italic">{b.author}</p>
          </div>
        </div>
      )
    },
    { header: 'Genre', key: 'category', className: 'text-xs font-black uppercase text-gray-400 tracking-widest' },
    { 
      header: 'Availability', 
      key: 'available_copies',
      render: (b: any) => (
        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${b.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {b.available_copies > 0 ? `${b.available_copies} In Stock` : 'Lent Out'}
        </span>
      )
    }
  ];

  const borrowingColumns = [
    { 
      header: 'Student', 
      key: 'student_name',
      render: (log: any) => (
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">{(log.student_name || 'S')[0]}</div>
           <span className="text-sm font-bold text-gray-700">{log.student_name}</span>
        </div>
      )
    },
    { header: 'Book Title', key: 'book_title', className: 'text-sm text-gray-500 font-medium' },
    { header: 'Due Date', key: 'due_date', className: 'text-xs font-bold text-red-400' },
    { 
      header: 'Status / Action', 
      key: 'status',
      render: (log: any) => (
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${log.returned ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {log.returned ? 'Returned' : 'Active Loan'}
          </span>
          {!log.returned && (
            <button onClick={() => handleReturn(log.id)} className="p-1 text-brand-primary hover:bg-blue-50 rounded-lg" title="Mark as Returned">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Library Engine</h2>
          <p className="text-sm text-gray-500 font-medium">Curating institutional knowledge assets</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveView('inventory')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'inventory' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Book size={16}/> Catalog</button>
          <button onClick={() => setActiveView('borrowings')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'borrowings' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><History size={16}/> Log</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={activeView === 'inventory' ? "Search catalog..." : "Search loan registry..."}
            value={activeView === 'inventory' ? inventoryTable.search : borrowingsTable.search}
            onChange={(e) => activeView === 'inventory' ? inventoryTable.setSearch(e.target.value) : borrowingsTable.setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:border-brand-primary transition-all" 
          />
        </div>
        <button 
          onClick={() => activeView === 'inventory' ? null : setIsIssueModalOpen(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={18} /> {activeView === 'inventory' ? 'Add Asset' : 'Issue Book'}
        </button>
      </div>

      <DataTable 
        columns={activeView === 'inventory' ? inventoryColumns : borrowingColumns} 
        data={activeView === 'inventory' ? inventoryTable.data : borrowingsTable.data} 
        isLoading={activeView === 'inventory' ? inventoryTable.isLoading : borrowingsTable.isLoading} 
      />

      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Circulation: Issue Asset">
        <form onSubmit={(e) => { e.preventDefault(); submitIssue(issueData); }} className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Borrower (Student)</label>
             <select 
               required value={issueData.student_id} onChange={e => setIssueData({...issueData, student_id: e.target.value})}
               className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
             >
               <option value="">Select Student</option>
               {studentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Asset (Book)</label>
             <select 
               required value={issueData.book_id} onChange={e => setIssueData({...issueData, book_id: e.target.value})}
               className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
             >
               <option value="">Select Book</option>
               {bookOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maturity Date (Due)</label>
             <input 
               required type="date" value={issueData.due_date} onChange={e => setIssueData({...issueData, due_date: e.target.value})}
               className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold"
             />
           </div>
           <button 
             type="submit" disabled={isIssuing}
             className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
           >
             {isIssuing ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18}/> Authorize Loan</>}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default Library;
