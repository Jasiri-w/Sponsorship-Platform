import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export default function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  iconColor = "text-blue-800",
  valueColor = "text-black"
}: StatsCardProps) {
  const iconBgColor = iconColor.replace('text-', 'bg-').replace('-800', '-100');
  
  return (
    <div className="dashboard-card">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-lg font-medium text-gray-800">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}