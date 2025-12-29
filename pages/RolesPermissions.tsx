
import React from 'react';
import { Lock, Shield, Check, X, Edit3 } from 'lucide-react';

const RolesPermissions: React.FC = () => {
  const permissions = ['View Dashboard', 'Manage Students', 'Edit Finances', 'Grade Students', 'System Settings'];
  const roles = ['School Admin', 'Teacher', 'Bursar', 'Registrar'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Access Control</h2>
          <p className="text-sm text-gray-500 font-medium">Manage user roles and system-wide permissions</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg">
          <Shield size={18} /> New Role
        </button>
      </div>

      <div className="card-premium overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Permission Module</th>
                {roles.map(r => <th key={r} className="px-6 py-4 text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {permissions.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{p}</td>
                  {roles.map(r => (
                    <td key={r} className="px-6 py-4">
                      <div className="flex justify-center">
                        {Math.random() > 0.4 ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-300" />}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
