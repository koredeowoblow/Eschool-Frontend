
import React, { useState, useEffect } from 'react';
import { Lock, Shield, Check, X, Loader2, Plus, Settings, AlertCircle } from 'lucide-react';
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
        api.get('/roles'), // GET api/v1/roles
        api.get('/roles/permissions') // GET api/v1/roles/permissions
      ]);
      setRoles(rolesRes.data.data || rolesRes.data || []);
      setPermissions(permsRes.data.data || permsRes.data || []);
    } catch (err) {
      console.error("Failed to load ACL data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Identity & Access</h2>
          <p className="text-sm text-gray-500 font-medium">Fine-grained RBAC for school administration</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Shield size={18} /> Provision New Role
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Validating Security Policy...</p>
            </div>
          ) : roles.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Capability / Policy</th>
                  {roles.map(r => <th key={r.id} className="px-6 py-4 text-center">{r.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-700">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{p.guard_name || 'web'}</p>
                    </td>
                    {roles.map(r => (
                      <td key={`${r.id}-${p.id}`} className="px-6 py-4">
                        <div className="flex justify-center">
                          {r.permissions?.some((rp: any) => rp.id === p.id) ? (
                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-sm border border-green-100"><Check size={14} /></div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-300"><X size={14} /></div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-2">
               <AlertCircle size={32} />
               <p className="font-bold">Access list is empty or unavailable.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Security Role Definition">
        <form className="space-y-4">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Identifier</label>
             <input type="text" className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold" placeholder="e.g. Content Moderator" />
           </div>
           <button className="w-full py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg">Save Authorization Policy</button>
        </form>
      </Modal>
    </div>
  );
};

export default RolesPermissions;
