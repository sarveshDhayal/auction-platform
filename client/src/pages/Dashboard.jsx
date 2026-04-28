import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AuctionCard from '../components/AuctionCard';
import GlassCard from '../components/ui/GlassCard';
import { Activity, Gavel, Trophy, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockAuctions = [
  {
    id: '1',
    title: 'Vintage Rolex Submariner 1980',
    description: 'Rare vintage Rolex Submariner in excellent condition with original box and papers. A collector\'s dream piece.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop',
    currentBid: 12500,
    timeLeft: '00:15:42',
    watchers: 342,
    status: 'live'
  },
  {
    id: '2',
    title: 'MacBook Pro M3 Max 128GB',
    description: 'Brand new, sealed MacBook Pro 16-inch with M3 Max chip, 128GB Unified Memory, and 4TB SSD.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    currentBid: 4200,
    timeLeft: '02:45:10',
    watchers: 156,
    status: 'live'
  },
  {
    id: '3',
    title: 'Sony A7RV Camera Body',
    description: 'Lightly used Sony A7RV. Shutter count under 5000. Includes extra battery and 128GB CFexpress Type A card.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    currentBid: 2800,
    timeLeft: '12:30:00',
    watchers: 89,
    status: 'live'
  }
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <GlassCard className="p-5 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-white mb-2">{value}</h4>
      {trend && (
        <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
          {trendUp ? '↑' : '↓'} {trend} vs last month
        </span>
      )}
    </div>
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
  </GlassCard>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex gap-8">
      <Sidebar />
      
      <div className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-text-secondary">Here's what's happening with your auctions today.</p>
          </div>
          <Link to="/create-auction" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2">
            <Gavel className="w-4 h-4" /> Create Auction
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Bids" value="12" icon={Activity} trend="14%" trendUp={true} />
          <StatCard title="Auctions Created" value="4" icon={Gavel} trend="2" trendUp={true} />
          <StatCard title="Auctions Won" value="2" icon={Trophy} />
          <StatCard title="Total Spent" value="$4,500" icon={DollarSign} trend="12%" trendUp={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Live Auctions */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                Live Recommended Auctions
              </h2>
              <a href="#" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockAuctions.slice(0,2).map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Recent Activity */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <GlassCard className="p-0 overflow-hidden">
              <div className="divide-y divide-white/10">
                {[
                  { action: 'Outbid', item: 'Sony A7RV', time: '5m ago', color: 'text-danger' },
                  { action: 'Bid Placed', item: 'Vintage Rolex', time: '1h ago', color: 'text-success' },
                  { action: 'Auction Ended', item: 'Herman Miller Chair', time: '2h ago', color: 'text-text-secondary' },
                  { action: 'Payment Success', item: 'Herman Miller Chair', time: '2h ago', color: 'text-primary' },
                ].map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold ${activity.color}`}>{activity.action}</span>
                      <span className="text-xs text-text-secondary">{activity.time}</span>
                    </div>
                    <p className="text-sm text-white line-clamp-1">{activity.item}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                <a href="#" className="text-sm text-primary hover:text-white font-medium transition-colors">View all activity</a>
              </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
