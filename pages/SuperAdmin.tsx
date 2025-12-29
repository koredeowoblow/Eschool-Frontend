import React, { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Server, Activity, Plus, ExternalLink, Loader2, Inbox } from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import api from '../services/api';

const SuperAdmin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuperAdminData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, schoolsRes] = await Promise.all([
          api.get('/super-admin/stats'),
          api.get('/super-admin/schools')
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setSchools(schoolsRes.data.data || schoolsRes.data || []);
      } catch (err) {
        console.error("Failed to load super admin data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuperAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Schools" value={stats?.total_schools || 0} icon={Globe} color="bg-brand-primary" trend={stats?.schools_trend} />
        <StatsCard label="Active Users" value={stats?.total_users?.toLocaleString() || 0} icon={Activity} color="bg-green-600" trend={stats?.users_trend} />
        <StatsCard label="Server Load" value={`${stats?.server_load || 0}%`} icon={Server} color="bg-blue-800" />
        <StatsCard label="Revenue (ARR)" value={`$${(stats?.annual_revenue || 0).toLocaleString()}`} icon={ShieldAlert} color="bg-orange-500" trend={stats?.revenue_trend} />
      </div>

      <div className="card-premium p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Registered Institutions</h2>
            <p className="text-sm text-gray-500 font-medium">Tenant monitoring and management</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all">
            <Plus size={18} /> Onboard School
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : schools.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <th className="px-4 py-4">Institution Name</th>
                  <th className="px-4 py-4">Admin Email</th>
                  <th className="px-4 py-4">Plan</th>
                  <th className="px-4 py-4">Users</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schools.map((school, i) => (
                  <tr key={school.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-5 font-bold text-gray-800">{school.name}</td>
                    <td className="px-4 py-5 text-sm text-gray-500">{school.email}</td>
                    <td className="px-4 py-5 font-black text-[10px] text-brand-primary uppercase tracking-widest">{school.subscription_plan || 'N/A'}</td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-600">{school.users_count?.toLocaleString() || 0}</td>
                    <td className="px-4 py-5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                        school.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-brand-primary transition-colors"><ExternalLink size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
              <Inbox size={48} strokeWidth={1} />
              <p className="font-bold">No registered institutions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;