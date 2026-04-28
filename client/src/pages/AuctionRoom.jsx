import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import BidBox from '../components/BidBox';
import Countdown from '../components/Countdown';
import BidHistory from '../components/BidHistory';
import { Users, AlertTriangle, ShieldCheck, Trophy, CreditCard } from 'lucide-react';

// Mock initial data
const INITIAL_AUCTION = {
  id: '1',
  title: 'Vintage Rolex Submariner 1980',
  description: 'Rare vintage Rolex Submariner (Ref 1680) in excellent condition. Features the original matte dial with beautiful cream-colored patina on the markers and hands. Case is unpolished with thick chamfers. Comes with original box, papers, and anchor.',
  image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop',
  startingPrice: 10000,
  minIncrement: 100,
  seller: { name: 'WatchCollector99', rating: '4.9' },
  watchers: 342,
};

const MOCK_BIDS = [
  { id: 'b3', user: { name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' }, amount: 12500, time: '2 mins ago' },
  { id: 'b2', user: { name: 'Sarah Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }, amount: 12400, time: '5 mins ago' },
  { id: 'b1', user: { name: 'Mike Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' }, amount: 12000, time: '15 mins ago' },
];

const AuctionRoom = () => {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState(INITIAL_AUCTION);
  const [bids, setBids] = useState(MOCK_BIDS);
  const [watchers, setWatchers] = useState(INITIAL_AUCTION.watchers);
  const [isEnded, setIsEnded] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const currentHighestBid = bids.length > 0 ? bids[0].amount : auction.startingPrice;
  // Set target date 2 minutes from now for demo purposes
  const [targetDate] = useState(new Date(Date.now() + 2 * 60000).toISOString());

  // Socket setup (mocked for now, but ready for backend integration)
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_auction', { auctionId: id });

    socket.on('new_bid', (bidData) => {
      // In real app, we'd add the new bid to the top
      setBids(prev => [bidData, ...prev]);
    });

    socket.on('watchers_update', (count) => {
      setWatchers(count);
    });

    return () => {
      socket.emit('leave_auction', { auctionId: id });
      socket.off('new_bid');
      socket.off('watchers_update');
    };
  }, [socket, id]);

  const handlePlaceBid = (amount) => {
    const newBid = {
      id: `b${Date.now()}`,
      user: { name: user?.name || 'You', avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=You` },
      amount,
      time: 'Just now'
    };
    
    // Optimistic UI update
    setBids(prev => [newBid, ...prev]);
    
    // In real app: socket.emit('place_bid', { auctionId: id, amount });
  };

  const handleAuctionEnd = () => {
    setIsEnded(true);
    setShowWinnerModal(true);
  };

  const winner = bids.length > 0 ? bids[0].user : null;
  const isWinner = winner?.name === (user?.name || 'You');

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      
      {/* Live Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {!isEnded && (
              <span className="flex items-center gap-1.5 bg-danger/20 text-danger px-3 py-1 rounded-full text-sm font-bold border border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                LIVE AUCTION
              </span>
            )}
            {isEnded && <Badge variant="secondary">AUCTION ENDED</Badge>}
            <Badge variant="outline">ID: #{id}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">{auction.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium text-white">{watchers} watching</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span className="font-medium text-white">Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-2 overflow-hidden">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50">
              <img 
                src={auction.image} 
                alt={auction.title} 
                className="w-full h-full object-contain"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Product Details</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              {auction.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-white/10">
              <div>
                <p className="text-xs text-text-secondary mb-1">Seller</p>
                <p className="font-medium text-white">{auction.seller.name}</p>
                <p className="text-xs text-warning">★ {auction.seller.rating}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Starting Price</p>
                <p className="font-medium text-white">${auction.startingPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Category</p>
                <p className="font-medium text-white">Watches</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Condition</p>
                <p className="font-medium text-white">Excellent (Pre-owned)</p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">Payment Pre-authorization Required</p>
                <p className="opacity-90">To place bids over $10,000, you must have a verified payment method on file. Holds are released immediately if you do not win.</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Bidding UI */}
        <div className="lg:col-span-1 space-y-6">
          
          <Countdown targetDate={targetDate} onEnd={handleAuctionEnd} />
          
          <BidBox 
            currentBid={currentHighestBid} 
            minIncrement={auction.minIncrement}
            onPlaceBid={handlePlaceBid}
            isEnded={isEnded}
          />

          <div className="h-[400px]">
            <BidHistory bids={bids} />
          </div>

        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card border-t-4 border-t-success p-8 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-success/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-success/20 text-success rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Trophy className="w-10 h-10" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">Auction Ended!</h2>
                <p className="text-text-secondary mb-6">The item has been sold to the highest bidder.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                  <p className="text-sm text-text-secondary mb-1">Winning Bid</p>
                  <p className="text-3xl font-bold text-success font-mono mb-4">${currentHighestBid.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-center gap-3">
                    <img src={winner?.avatar} alt={winner?.name} className="w-8 h-8 rounded-full border border-success" />
                    <span className="font-medium text-white">{winner?.name}</span>
                  </div>
                </div>

                {isWinner ? (
                  <Button className="w-full py-4 text-lg font-bold" variant="success">
                    <CreditCard className="w-5 h-5 mr-2" /> Pay Now via Stripe
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" onClick={() => setShowWinnerModal(false)}>
                    Close
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

export default AuctionRoom;
