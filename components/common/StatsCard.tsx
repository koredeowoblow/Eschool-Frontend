
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  return (
    <div className="card-premium p-6 flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white shadow-lg`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
