
import React from 'react';
import { FolderSearch, Plus, File, FileImage, FileText, Download, MoreVertical, Search, HardDrive } from 'lucide-react';

const FILES = [
  { id: 1, name: 'Term_2_Curriculum.pdf', type: 'PDF', size: '2.4 MB', date: 'May 20, 2024' },
  { id: 2, name: 'Staff_Meeting_Notes.docx', type: 'DOCX', size: '1.1 MB', date: 'May 18, 2024' },
  { id: 3, name: 'School_Logo_Original.png', type: 'PNG', size: '4.8 MB', date: 'May 15, 2024' },
  { id: 4, name: 'Annual_Report_2024.pdf', type: 'PDF', size: '12.4 MB', date: 'May 10, 2024' },
];

const Files: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Files & Media</h2>
          <p className="text-sm text-gray-500 font-medium">Centralized cloud storage for school resources</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all">
          <Plus size={18} /> Upload New File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card-premium p-6 bg-gradient-to-br from-brand-primary to-blue-700 text-white">
             <div className="flex items-center gap-2 mb-6">
                <HardDrive size={20} className="text-blue-200" />
                <h3 className="font-bold">Storage Usage</h3>
             </div>
             <div className="space-y-2">
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="bg-white h-full w-[42%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-100">
                   <span>4.2 GB Used</span>
                   <span>10 GB Total</span>
                </div>
             </div>
          </div>
          <div className="card-premium p-4">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Quick Folders</h4>
             <div className="space-y-1">
                {['Academics', 'Administration', 'School Events', 'Media'].map(f => (
                  <button key={f} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                     <FolderSearch size={16} className="text-brand-primary" /> {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
           <div className="card-premium p-4 flex items-center gap-4 bg-gray-50/20 border-gray-100">
              <Search className="text-gray-400" size={18} />
              <input type="text" placeholder="Search files by name..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium" />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FILES.map(file => (
                <div key={file.id} className="card-premium p-6 group hover:border-brand-primary/20 border border-transparent transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        file.type === 'PDF' ? 'bg-red-50 text-red-500' : file.type === 'PNG' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                      }`}>
                         {file.type === 'PDF' ? <FileText size={24}/> : file.type === 'PNG' ? <FileImage size={24}/> : <File size={24}/>}
                      </div>
                      <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors"><MoreVertical size={18}/></button>
                   </div>
                   <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{file.name}</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{file.size} • {file.date}</p>
                   <button className="w-full py-2 bg-gray-50 text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2">
                      <Download size={14}/> Download
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
