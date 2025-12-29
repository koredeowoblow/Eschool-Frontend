import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Trophy, CreditCard, Calendar, ArrowLeft, Phone, Mail, MapPin, Download, Sparkles, Loader2, BrainCircuit, Inbox } from 'lucide-react';
import { getAcademicAdvice } from '../services/geminiService';
import api from '../services/api';

const StudentDetail: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'results' | 'finance' | 'ai'>('profile');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Failed to load student details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  const handleGenerateAiInsight = async () => {
    if (!student) return;
    setIsAiLoading(true);
    const marksSummary = student.marks?.map((m: any) => `${m.subject}: ${m.total}% (${m.grade})`).join(', ') || 'No marks available';
    const prompt = `Analyze this student's performance: ${student.name} in ${student.class}. 
    Marks: ${marksSummary}. 
    Provide a professional teacher's comment and suggest 2 specific areas for improvement. Keep it brief.`;
    
    const result = await getAcademicAdvice(prompt);
    setAiInsight(result);
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'ai' && !aiInsight && student) {
      handleGenerateAiInsight();
    }
  }, [activeTab, student]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
        <Inbox size={48} />
        <p className="font-bold">Student record not found.</p>
        <Link to="/students" className="text-brand-primary font-bold hover:underline">Return to Directory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link to="/students" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-all group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Students
      </Link>

      <div className="card-premium overflow-hidden border-none">
        <div className="p-8 bg-gradient-to-r from-brand-primary to-blue-700 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl bg-white/10 flex items-center justify-center">
              {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" /> : <User size={48} />}
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.status === 'Active' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {student.status}
                </span>
              </div>
              <p className="text-blue-100 font-medium mb-6">Admission: {student.admissionNo} • {student.class}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <Trophy size={16} className="text-orange-400" /> Rank #{student.rank || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <Calendar size={16} className="text-green-400" /> {student.attendance || '0%'} Attendance
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-brand-primary rounded-2xl text-sm font-bold shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
              <Download size={18} /> Download Transcript
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 flex overflow-x-auto bg-gray-50/50">
          {[
            { id: 'profile', label: 'Student Profile', icon: User },
            { id: 'results', label: 'Academic History', icon: Trophy },
            { id: 'finance', label: 'Fees & Finance', icon: CreditCard },
            { id: 'ai', label: 'AI Insights', icon: BrainCircuit },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${
                activeTab === tab.id 
                  ? 'text-brand-primary border-brand-primary bg-white' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
              {tab.id === 'ai' && <span className="px-1.5 py-0.5 bg-brand-secondary text-white rounded text-[8px] animate-pulse">BETA</span>}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
              <div className="space-y-8">
                <h3 className="text-lg font-bold text-gray-800">Biographical Details</h3>
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><Mail size={18}/></div>
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Email Address</p><p className="text-sm font-bold text-gray-700">{student.email || 'N/A'}</p></div>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><Phone size={18}/></div>
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Phone Number</p><p className="text-sm font-bold text-gray-700">{student.phone || 'N/A'}</p></div>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm"><MapPin size={18}/></div>
                     <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Home Address</p><p className="text-sm font-bold text-gray-700">{student.address || 'N/A'}</p></div>
                   </div>
                </div>
              </div>
              <div className="space-y-8">
                <h3 className="text-lg font-bold text-gray-800">Parent/Guardian Info</h3>
                <div className="p-6 border border-gray-100 rounded-3xl bg-gray-50/30">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black text-xl">
                      {student.parent?.split(' ').map((n: string) => n[0]).join('') || 'GD'}
                    </div>
                    <div><h4 className="font-bold text-gray-800">{student.parent || 'No linked guardian'}</h4><p className="text-xs text-gray-400 font-medium">Primary Guardian</p></div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between text-sm font-bold"><span className="text-gray-400">Relation</span><span className="text-gray-700">{student.parentRelation || 'Guardian'}</span></div>
                     <div className="flex justify-between text-sm font-bold"><span className="text-gray-400">Occupation</span><span className="text-gray-700">{student.parentOccupation || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               {student.marks?.length > 0 ? (
                 <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                       <tr><th className="px-6 py-4">Subject</th><th className="px-6 py-4">CA</th><th className="px-6 py-4">Exam</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Grade</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {student.marks.map((sub: any, i: number) => (
                         <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 text-sm font-bold text-gray-700">{sub.subject}</td>
                           <td className="px-6 py-4 text-sm text-gray-600">{sub.ca || 0}/40</td>
                           <td className="px-6 py-4 text-sm text-gray-600">{sub.exam || 0}/60</td>
                           <td className="px-6 py-4 font-black text-brand-primary">{sub.total || 0}%</td>
                           <td className="px-6 py-4"><span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                              sub.grade === 'A' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                           }`}>{sub.grade || '-'}</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="text-center py-12 text-gray-400 font-bold">No academic records found for current term.</div>
               )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
               <div className="card-premium p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary opacity-20 blur-3xl -mr-24 -mt-24"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                          <Sparkles className="text-brand-secondary" size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-tight italic">Gemini Intelligence</h3>
                          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Performance Analysis Engine</p>
                       </div>
                    </div>
                    
                    {isAiLoading ? (
                      <div className="flex flex-col items-center py-12 gap-4">
                        <Loader2 className="animate-spin text-brand-secondary" size={32} />
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Processing Academic Data...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="prose prose-invert prose-sm">
                           <p className="text-indigo-50 leading-relaxed font-medium text-lg italic">"{aiInsight || 'No insights generated yet.'}"</p>
                        </div>
                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Insights are AI generated &middot; V3.1</span>
                           <button onClick={handleGenerateAiInsight} className="text-xs font-black text-brand-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
                             Regenerate <Sparkles size={12}/>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Billed</p>
                  <p className="text-2xl font-black text-blue-900">${student.totalBilled?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Amount Paid</p>
                  <p className="text-2xl font-black text-green-900">${student.totalPaid?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Outstanding</p>
                  <p className="text-2xl font-black text-red-900">${student.outstanding?.toLocaleString() || '0.00'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;