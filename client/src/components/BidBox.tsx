import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowUp, AlertCircle } from 'lucide-react';
import Button from './ui/Button';

const BidBox = ({ currentBid, minIncrement, onPlaceBid, isEnded, disabled }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [isBidding, setIsBidding] = useState(false);

  const minValidBid = currentBid + minIncrement;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(bidAmount);

    if (isNaN(amount)) {
      setError('Please enter a valid amount.');
      return;
    }

    if (amount < minValidBid) {
      setError(`Minimum bid must be $${minValidBid.toLocaleString()}`);
      return;
    }

    setIsBidding(true);

    // Use an async approach to handle the bid
    const submitBid = async () => {
      try {
        await onPlaceBid(amount);
        setBidAmount('');
      } catch (err) {
        setError(err.message || 'Failed to place bid');
      } finally {
        setIsBidding(false);
      }
    };

    submitBid();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-text-secondary mb-1">Current Highest Bid</p>
          <motion.p
            key={currentBid}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            className="text-4xl font-bold font-mono tracking-tight"
          >
            ${currentBid.toLocaleString()}
          </motion.p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary mb-1">Min. Increment</p>
          <p className="text-sm font-semibold text-white">${minIncrement.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              if (error) setError('');
            }}
            placeholder={`Enter $${minValidBid.toLocaleString()} or more`}
            disabled={isEnded || isBidding || disabled}
            className={`w-full bg-background border ${error ? 'border-danger focus:ring-danger/50' : 'border-white/20 focus:ring-primary/50'} rounded-xl py-4 pl-12 pr-4 text-xl font-bold font-mono text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
            step="0.01"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-danger text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[minValidBid, minValidBid + 50, minValidBid + 100].map((quickBid) => (
            <button
              key={quickBid}
              type="button"
              onClick={() => setBidAmount(quickBid.toString())}
              disabled={isEnded || isBidding || disabled}
              className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              +${quickBid.toLocaleString()}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          disabled={isEnded || isBidding || disabled}
          isLoading={isBidding}
        >
          {isEnded ? 'Auction Ended' : (
            <>
              Place Bid Now <ArrowUp className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default BidBox;
