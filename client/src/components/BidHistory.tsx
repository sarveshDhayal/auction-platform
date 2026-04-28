import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Crown } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { Bid } from '../types';

interface BidHistoryProps {
  bids: Bid[];
}

const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
  return (
    <GlassCard className="p-0 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Live Bids
        </h3>
        <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">
          {bids.length} bids
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
        {bids.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary p-6 text-center">
            <History className="w-12 h-12 mb-3 opacity-20" />
            <p>No bids yet. Be the first to place a bid!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {bids.map((bid, index) => {
              const isHighest = index === 0;

              return (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className={`p-3 rounded-xl border flex items-center justify-between ${isHighest
                      ? 'bg-success/10 border-success/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                      : 'bg-white/5 border-white/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={bid.user.avatar}
                      alt={bid.user.name}
                      className={`w-10 h-10 rounded-full border ${isHighest ? 'border-success' : 'border-white/10'}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        {bid.user.name}
                        {isHighest && <Crown className="w-4 h-4 text-warning" />}
                      </p>
                      <p className="text-xs text-text-secondary">{bid.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${isHighest ? 'text-success text-lg' : 'text-white'}`}>
                      ${bid.amount.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
};

export default BidHistory;
