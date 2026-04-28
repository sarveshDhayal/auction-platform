import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { TrendingUp, Trophy, XCircle, X, ExternalLink, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Re-using the same icons with descriptive names for clarity in the status logic
const WinningIcon = TrendingUp;
const WonIcon = Trophy;
const OutbidIcon = XCircle;

interface HistoryItem {
  id: string;
  auctionId: string;
  item: string;
  date: string;
  amount: string;
  status: string;
  isWinning: boolean;
  seller: string;
}

const BiddingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedBid, setSelectedBid] = useState<HistoryItem | null>(null);

  const { data: historyData = [], isLoading } = useQuery({
    queryKey: ['bidding-history'],
    queryFn: async () => {
      const response = await api.get<any>('/bids/my-history');
      return response.data.data.map((item: any) => ({
        ...item,
        amount: `$${Number(item.amount).toLocaleString()}`,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      }));
    }
  });

  const getStatusIcon = (status: string, isWinning: boolean) => {
    if (status === 'ended' && isWinning) return WonIcon;
    if (isWinning) return WinningIcon;
    return OutbidIcon;
  };

  const getStatusColor = (status: string, isWinning: boolean) => {
    if (status === 'ended' && isWinning) return 'text-success';
    if (isWinning) return 'text-primary';
    return 'text-danger';
  };

  const filteredData = historyData.filter((item: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'winning') return item.isWinning && item.status !== 'ended';
    if (activeTab === 'won') return item.isWinning && item.status === 'ended';
    return true;
  });

  return (
    <div className="flex gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20">
      <Sidebar />
      <div className="flex-1">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Bidding History</h1>
          <p className="text-text-secondary">Track all your past and current bidding activity.</p>
        </div>

        <GlassCard className="p-0 overflow-hidden mb-8">
          <div className="flex items-center gap-6 px-6 pt-6 border-b border-white/10">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-4 -mb-[1px] font-medium text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'text-white border-primary' : 'text-text-secondary border-transparent hover:text-white'}`}
            >
              All Bids
            </button>
            <button 
              onClick={() => setActiveTab('winning')}
              className={`pb-4 -mb-[1px] font-medium text-sm transition-colors border-b-2 ${activeTab === 'winning' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-white'}`}
            >
              Winning
            </button>
            <button 
              onClick={() => setActiveTab('won')}
              className={`pb-4 -mb-[1px] font-medium text-sm transition-colors border-b-2 ${activeTab === 'won' ? 'text-success border-success' : 'text-text-secondary border-transparent hover:text-white'}`}
            >
              Won Items
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-20 text-text-secondary">Loading history...</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20 text-text-secondary">No bidding history found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">My Highest Bid</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredData.map((row) => {
                    const Icon = getStatusIcon(row.status, row.isWinning);
                    const colorClass = getStatusColor(row.status, row.isWinning);
                    const statusText = row.status === 'ended' && row.isWinning ? 'Won' : row.isWinning ? 'Winning' : 'Outbid';

                    return (
                      <tr 
                        key={row.id} 
                        onClick={() => setSelectedBid(row)}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-primary transition-colors">{row.item}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{row.date}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{row.amount}</td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium ${colorClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {statusText}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>

      </div>

      {/* Bidding Detail Modal */}
      <AnimatePresence>
        {selectedBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBid(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-0 overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium mb-3 ${getStatusColor(selectedBid.status, selectedBid.isWinning)}`}>
                    {React.createElement(getStatusIcon(selectedBid.status, selectedBid.isWinning), { className: "w-3.5 h-3.5" })}
                    {selectedBid.status === 'ended' && selectedBid.isWinning ? 'Won' : selectedBid.isWinning ? 'Winning' : 'Outbid'}
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedBid.item}</h3>
                </div>
                <button 
                  onClick={() => setSelectedBid(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-text-secondary hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-text-secondary flex items-center gap-1.5 mb-1"><DollarSign className="w-3.5 h-3.5" /> My Highest Bid</p>
                    <p className="text-2xl font-bold text-white">{selectedBid.amount}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">Auction Date</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-secondary" /> {selectedBid.date}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">Seller</span>
                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{selectedBid.seller}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex gap-3">
                {selectedBid.status === 'ended' && selectedBid.isWinning ? (
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/payments', { state: { item: selectedBid } })}
                  >
                    Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : selectedBid.isWinning ? (
                  <Button className="w-full" onClick={() => navigate(`/auction/${selectedBid.auctionId}`)}>
                    View Auction <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" onClick={() => navigate(`/auction/${selectedBid.auctionId}`)}>
                    Place Higher Bid <WinningIcon className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BiddingHistory;
