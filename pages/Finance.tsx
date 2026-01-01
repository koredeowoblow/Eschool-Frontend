import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, TrendingUp, AlertCircle, Loader2, Inbox } from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import api from '../services/api';

const Finance: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, invoicesRes] = await Promise.all([
          api.get('/finance/overview'),
          api.get('/invoices', { params: { per_page: 5 } })
        ]);
        setStats(overviewRes.data.data || overviewRes.data);
        setRecentInvoices(invoicesRes.data.data || invoicesRes.data);
      } catch (err) {
        console.error("Failed to load finance data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-600"
          trend={stats?.revenue_trend}
        />
        <StatsCard
          label="Outstanding"
          value={`$${(stats?.total_outstanding || 0).toLocaleString()}`}
          icon={AlertCircle}
          color="bg-red-500"
        />
        <StatsCard
          label="Pending Invoices"
          value={stats?.pending_invoices_count || 0}
          icon={FileText}
          color="bg-orange-500"
        />
      </div>

      <div className="card-premium p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Invoices</h2>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>
          ) : recentInvoices.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Fee Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="text-sm">
                    <td className="px-4 py-4 font-bold text-brand-primary">{inv.id}</td>
                    <td className="px-4 py-4 font-semibold text-gray-800">{inv.student_name}</td>
                    <td className="px-4 py-4 text-gray-500">{inv.type}</td>
                    <td className="px-4 py-4 font-bold text-gray-800">${inv.amount?.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400 font-medium">{inv.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
              <Inbox size={48} strokeWidth={1} />
              <p className="font-bold text-sm">No recent invoices found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;