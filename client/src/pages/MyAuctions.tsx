import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AuctionCard from '../components/AuctionCard';
import { Gavel, Search } from 'lucide-react';
import api from '../services/api';
import { Auction } from '../types';

const MyAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyAuctions = async () => {
      try {
        const response = await api.get<any>('/auctions/user/my-auctions');
        const formatted: Auction[] = response.data.data.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          image: a.imageUrl || 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80',
          currentBid: parseFloat(a.currentHighestBid || a.startingPrice),
          endTime: a.endTime,
          category: a.category,
          watchers: Math.floor(Math.random() * 50) + 1
        }));
        setAuctions(formatted);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAuctions();
  }, []);

  return (
    <div className="flex gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
      <Sidebar />
      <div className="flex-1">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Auctions</h1>
            <p className="text-text-secondary">Manage and track the performance of your listings.</p>
          </div>
          <Link to="/create-auction" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 flex items-center gap-2">
            <Gavel className="w-4 h-4" /> Create New Auction
          </Link>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex gap-4 w-full sm:w-auto">
             <button className="px-4 py-2 text-sm font-medium bg-primary/20 text-primary border border-primary/30 rounded-lg">All Active</button>
             <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors">Completed</button>
             <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors">Drafts</button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search my auctions..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-text-secondary py-10">Loading your auctions...</div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} onClick={() => navigate(`/auction/${auction.id}`)} className="cursor-pointer">
                <AuctionCard 
                  auction={auction} 
                  isWatchlisted={false}
                  onToggleWatchlist={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
               <Gavel className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No auctions yet</h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">You haven't created any auctions. Start selling your items today to a global audience.</p>
            <Link to="/create-auction" className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-lg inline-block">
              Create First Auction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
