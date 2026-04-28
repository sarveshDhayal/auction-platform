import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { TrendingUp, Trophy, XCircle, X, ExternalLink, Calendar, DollarSign, ArrowRight, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryItem {
  id: number;
  item: string;
  date: string;
  amount: string;
  maxBid: string;
  status: string;
  icon: LucideIcon;
  color: string;
  bidsPlaced: number;
  seller: string;
}

const BiddingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedBid, setSelectedBid] = useState<HistoryItem | null>(null);

  // Mock data for history
  const historyData: HistoryItem[] = [
    { id: 1, item: 'Sony A7RV Camera Body', date: 'Oct 24, 2023', amount: '$3,250', maxBid: '$3,500', status: 'Winning', icon: TrendingUp, color: 'text-primary', bidsPlaced: 4, seller: 'CameraStorePro' },
    { id: 2, item: 'Herman Miller Aeron Chair', date: 'Oct 22, 2023', amount: '$850', maxBid: '$850', status: 'Outbid', icon: XCircle, color: 'text-danger', bidsPlaced: 2, seller: 'OfficeFurn' },
    { id: 3, item: 'Vintage 1960s Rolex Submariner', date: 'Oct 15, 2023', amount: '$12,400', maxBid: '$13,000', status: 'Won', icon: Trophy, color: 'text-success', bidsPlaced: 12, seller: 'VintageTime' },
    { id: 4, item: 'Apple MacBook Pro M3 Max', date: 'Oct 10, 2023', amount: '$4,100', maxBid: '$4,100', status: 'Won', icon: Trophy, color: 'text-success', bidsPlaced: 5, seller: 'TechReseller' },
    { id: 5, item: 'PlayStation 5 Anniversary Edition', date: 'Oct 05, 2023', amount: '$650', maxBid: '$650', status: 'Outbid', icon: XCircle, color: 'text-danger', bidsPlaced: 1, seller: 'GamerGear' },
  ];

  const filteredData = historyData.filter(item => {
    if (activeTab === 'all') return true;
    return item.status.toLowerCase() === activeTab;
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
                {filteredData.map((row) => (
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
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium ${row.color}`}>
                        <row.icon className="w-3.5 h-3.5" />
                        {row.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-white/10 text-center">
            <button className="text-sm font-medium text-primary hover:text-white transition-colors">Load More History</button>
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
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium mb-3 ${selectedBid.color}`}>
                    <selectedBid.icon className="w-3.5 h-3.5" />
                    {selectedBid.status}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-text-secondary flex items-center gap-1.5 mb-1"><DollarSign className="w-3.5 h-3.5" /> My Highest Bid</p>
                    <p className="text-2xl font-bold text-white">{selectedBid.amount}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-text-secondary flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Your Max Bid Limit</p>
                    <p className="text-2xl font-bold text-white">{selectedBid.maxBid}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">Auction Date</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-secondary" /> {selectedBid.date}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">Total Bids Placed By You</span>
                    <span className="text-sm font-medium text-white">{selectedBid.bidsPlaced} bids</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-text-secondary">Seller</span>
                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{selectedBid.seller}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex gap-3">
                {selectedBid.status === 'Won' ? (
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/payments', { state: { item: selectedBid } })}
                  >
                    Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : selectedBid.status === 'Winning' ? (
                  <Button className="w-full">
                    Increase Max Bid <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline">
                    View Similar Items <ExternalLink className="w-4 h-4 ml-2" />
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
