import React, { useState, useEffect } from 'react';
import { Lock, Shield, Check, X, Loader2, Plus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'), 
        api.get('/roles/permissions')
      ]);
      
      // Defensively extract data
      const rolesData = rolesRes.data?.data ?? rolesRes.data;
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      
      const permsData = permsRes.data?.data ?? permsRes.data;
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (err) {
      console.warn("ACL Synchronization limited:", err);
      setRoles([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Final render-time safety guards
  const safeRoles = Array.isArray(roles) ? roles.filter(Boolean) : [];
  const safePermissions = Array.isArray(permissions) ? permissions.filter(Boolean) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Identity & Access Control</h2>
          <p className="text-sm text-gray-500 font-medium">Fine-grained RBAC policies for institutional administration</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <Shield size={18} /> Provision New Role
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-32 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Validating Security Policy...</p>
            </div>
          ) : safeRoles.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-5 min-w-[240px]">Capability Identifier</th>
                  {safeRoles.map(r => (
                    <th key={r.id || r.name} className="px-4 py-5 text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {safePermissions.length > 0 ? safePermissions.map((p) => (
                  <tr key={p.id || p.name} className="hover:bg-gray-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-700">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">{p.guard_name || 'web'}</p>
                    </td>
                    {safeRoles.map(r => {
                      const hasPerm = Array.isArray(r.permissions) && r.permissions.some((rp: any) => rp.id === p.id);
                      return (
                        <td key={`${r.id}-${p.id}`} className="px-4 py-4">
                          <div className="flex justify-center">
                            {hasPerm ? (
                              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-sm border border-green-100 animate-in zoom-in duration-300">
                                <Check size={14} />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                <X size={14} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={safeRoles.length + 1} className="py-20 text-center text-gray-400 font-bold italic">No permissions defined in the schema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-32 text-gray-400 flex flex-col items-center gap-4">
               <AlertCircle size={48} strokeWidth={1} />
               <p className="font-bold text-sm">Authorization matrix unavailable.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Security Role Definition">
        <form className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Unique Identifier</label>
             <input type="text" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:border-brand-primary" placeholder="e.g. Regional Supervisor" />
           </div>
           <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all mt-2">
             Save Authorization Policy
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default RolesPermissions;