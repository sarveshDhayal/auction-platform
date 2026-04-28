import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Users, AlertTriangle, DollarSign, Activity, ShieldCheck, LucideIcon } from 'lucide-react';

interface RevenueData {
  name: string;
  amount: number;
}

const REVENUE_DATA: RevenueData[] = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 5000 },
  { name: 'Apr', amount: 4500 },
  { name: 'May', amount: 7000 },
  { name: 'Jun', amount: 8500 },
  { name: 'Jul', amount: 11000 },
];

interface PerformanceData {
  name: string;
  completed: number;
  failed: number;
}

const AUCTION_PERFORMANCE: PerformanceData[] = [
  { name: 'Electronics', completed: 120, failed: 10 },
  { name: 'Watches', completed: 85, failed: 5 },
  { name: 'Art', completed: 40, failed: 8 },
  { name: 'Vehicles', completed: 15, failed: 2 },
];

interface RecentUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  joined: string;
}

const RECENT_USERS: RecentUser[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', status: 'active', joined: '2h ago' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', status: 'suspended', joined: '1d ago' },
  { id: 'u3', name: 'Mike Johnson', email: 'mike@example.com', status: 'active', joined: '3d ago' },
];

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, colorClass }) => (
  <GlassCard className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-medium ${trend > 0 ? 'text-success' : 'text-danger'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h4 className="text-3xl font-bold text-white mb-1">{value}</h4>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
    </div>
  </GlassCard>
);

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
          <p className="text-text-secondary">System overview, analytics, and moderation tools.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value="$45,231" icon={DollarSign} trend={12.5} colorClass="text-success" />
          <StatCard title="Active Users" value="2,845" icon={Users} trend={5.2} colorClass="text-primary" />
          <StatCard title="Live Auctions" value="156" icon={Activity} trend={-2.4} colorClass="text-warning" />
          <StatCard title="Flagged Items" value="12" icon={AlertTriangle} trend={0} colorClass="text-danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Chart */}
          <GlassCard className="lg:col-span-2 p-6 h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Growth</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <CartesianGrid stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="name" stroke="#CBD5E1" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#CBD5E1" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Secondary Chart */}
          <GlassCard className="lg:col-span-1 p-6 h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Performance by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AUCTION_PERFORMANCE} layout="vertical" margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#ffffff" strokeOpacity={0.05} horizontal={false} />
                <XAxis type="number" stroke="#CBD5E1" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#CBD5E1" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Management Table */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Recent Users</h3>
              <button className="text-sm text-primary hover:text-white transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-wider text-text-secondary border-b border-white/10">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {RECENT_USERS.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">{user.joined}</td>
                      <td className="p-4">
                        <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-text-secondary hover:text-white transition-colors mr-3">Edit</button>
                        {user.status === 'active' ? (
                          <button className="text-danger hover:text-red-400 transition-colors">Suspend</button>
                        ) : (
                          <button className="text-success hover:text-emerald-400 transition-colors">Activate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Fraud Detection Panel */}
          <GlassCard className="p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-danger/5">
              <h3 className="text-lg font-bold text-danger flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Fraud Alerts
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <ShieldCheck className="w-16 h-16 text-success/50 mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">System Secure</h4>
              <p className="text-sm text-text-secondary max-w-sm">
                No suspicious bidding patterns or unverified payment methods detected in the last 24 hours. Automated ML systems are active.
              </p>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
