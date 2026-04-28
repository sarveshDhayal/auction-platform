import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AuctionCard from '../components/AuctionCard';
import GlassCard from '../components/ui/GlassCard';
import { Activity, Gavel, Trophy, DollarSign, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'watchlist'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      let fetchedAuctions = [];
      try {
        const response = await api.get('/auctions?limit=6');
        fetchedAuctions = response.data.data.map(a => ({
          id: a.id,
          title: a.title,
          image: a.imageUrl || 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80',
          currentBid: parseFloat(a.currentHighestBid || a.startingPrice),
          endTime: a.endTime,
          bids: a.bids?.length || 0,
          watchers: Math.floor(Math.random() * 50) + 1
        }));
        
        const watchlistRes = await api.get('/watchlist/my');
        const formattedWatchlist = watchlistRes.data.data.map(a => ({
          id: a.id,
          title: a.title,
          image: a.imageUrl || 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80',
          currentBid: parseFloat(a.currentHighestBid || a.startingPrice),
          endTime: a.endTime,
          bids: a.bids?.length || 0,
          watchers: Math.floor(Math.random() * 50) + 1
        }));
        setWatchlist(formattedWatchlist);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (fetchedAuctions.length === 0) {
          fetchedAuctions = [
            {
              id: 'mock-1',
              title: 'Sony A7RV Camera Body',
              image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
              currentBid: 3250,
              endTime: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
              bids: 14,
              watchers: 24
            },
            {
              id: 'mock-2',
              title: 'Vintage 1960s Rolex Submariner',
              image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80',
              currentBid: 12400,
              endTime: new Date(Date.now() + 3600000 * 24).toISOString(), // 24 hours from now
              bids: 32,
              watchers: 156
            }
          ];
        }
        setAuctions(fetchedAuctions);
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleToggleWatchlist = async (auctionId, isCurrentlyWatchlisted) => {
    try {
      if (isCurrentlyWatchlisted) {
        await api.delete(`/watchlist/remove/${auctionId}`);
        setWatchlist(prev => prev.filter(a => a.id !== auctionId));
      } else {
        const res = await api.post('/watchlist/add', { auctionId });
        // Instead of fetching all again, just append the auction from `auctions` array to `watchlist`
        const targetAuction = auctions.find(a => a.id === auctionId);
        if (targetAuction) {
          setWatchlist(prev => [targetAuction, ...prev]);
        } else {
           // In case they click from another page, but here we know it's from Dashboard
           // Fetching single auction could work, but for now just reload
           const watchlistRes = await api.get('/watchlist/my');
           // Format omitted for brevity, best to just rely on the array we have
        }
      }
    } catch (err) {
      console.error('Watchlist toggle error', err);
    }
  };

  const displayedAuctions = activeTab === 'recommended' ? auctions : watchlist;

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Bids" value="12" icon={Activity} trend="14%" trendUp={true} />
          <StatCard title="Auctions Created" value="4" icon={Gavel} trend="2" trendUp={true} />
          <StatCard title="Auctions Won" value="2" icon={Trophy} />
          <StatCard title="Total Spent" value="$4,500" icon={DollarSign} trend="12%" trendUp={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveTab('recommended')}
                  className={`text-lg font-bold flex items-center gap-2 pb-4 -mb-[17px] border-b-2 transition-colors ${
                    activeTab === 'recommended' ? 'text-white border-primary' : 'text-text-secondary border-transparent hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'recommended' ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`}></div>
                  Recommended
                </button>
                <button 
                  onClick={() => setActiveTab('watchlist')}
                  className={`text-lg font-bold flex items-center gap-2 pb-4 -mb-[17px] border-b-2 transition-colors ${
                    activeTab === 'watchlist' ? 'text-white border-red-500' : 'text-text-secondary border-transparent hover:text-white'
                  }`}
                >
                  My Watchlist
                  {watchlist.length > 0 && (
                    <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded-full">{watchlist.length}</span>
                  )}
                </button>
              </div>
              <button className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center text-text-secondary py-10">Loading auctions...</div>
            ) : displayedAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedAuctions.map((auction) => (
                  <div key={auction.id} onClick={() => navigate(`/auction/${auction.id}`)} className="cursor-pointer">
                    <AuctionCard 
                      auction={auction} 
                      isWatchlisted={watchlist.some(w => w.id === auction.id)}
                      onToggleWatchlist={handleToggleWatchlist}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-text-secondary py-10 border border-white/5 rounded-xl bg-white/5">
                {activeTab === 'recommended' ? 'No active auctions found. Be the first to create one!' : 'Your watchlist is empty. Click the heart icon on any auction to save it!'}
              </div>
            )}
          </div>

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
                  <Link to="/history" key={i} className="block p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold ${activity.color}`}>{activity.action}</span>
                      <span className="text-xs text-text-secondary">{activity.time}</span>
                    </div>
                    <p className="text-sm text-white line-clamp-1">{activity.item}</p>
                  </Link>
                ))}
              </div>
              <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                <Link to="/history" className="text-sm text-primary hover:text-white font-medium transition-colors">View all activity</Link>
              </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
