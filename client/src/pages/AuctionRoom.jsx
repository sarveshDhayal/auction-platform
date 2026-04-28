import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import BidBox from '../components/BidBox';
import BidHistory from '../components/BidHistory';
import Countdown from '../components/Countdown';
import Loader from '../components/Loader';
import CheckoutForm from '../components/CheckoutForm';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuctionRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchers, setWatchers] = useState(1);
  const [bids, setBids] = useState([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Stripe state
  const [clientSecret, setClientSecret] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  // Initialize Stripe (Must be outside component or using environment variable)
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

  // 1. Fetch initial auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await api.get(`/auctions/${id}`);
        const data = response.data.data;
        setAuction(data);
        
        // Format bids for the BidHistory component
        if (data.bids) {
          const formattedBids = data.bids.map(b => ({
            id: b.id,
            user: { name: b.bidder.fullName, avatar: b.bidder.avatarUrl },
            amount: parseFloat(b.amount),
            time: b.createdAt
          }));
          setBids(formattedBids);
        }

        if (data.status === 'ended') {
          setWinner(data.winner);
          setShowWinnerModal(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load auction');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  // 2. Setup Socket event listeners
  useEffect(() => {
    if (!socket || !connected || !auction) return;

    // Join the specific room
    socket.emit('join_auction', { auctionId: id });

    // Listen for events
    socket.on('watchers_update', (count) => {
      setWatchers(count);
    });

    socket.on('new_bid', (newBid) => {
      setBids(prev => [newBid, ...prev]);
      setAuction(prev => ({ ...prev, currentHighestBid: newBid.amount }));
    });

    socket.on('auction_ended', (data) => {
      setAuction(prev => ({ ...prev, status: 'ended' }));
      setWinner(data.winner);
      setShowWinnerModal(true);
    });

    // Cleanup
    return () => {
      socket.emit('leave_auction', { auctionId: id });
      socket.off('watchers_update');
      socket.off('new_bid');
      socket.off('auction_ended');
    };
  }, [socket, connected, auction, id]);

  const handlePlaceBid = async (amount) => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) return reject(new Error('Live connection lost'));
      
      socket.emit('place_bid', { auctionId: id, amount }, (response) => {
        if (response.status === 'success') {
          resolve(response.data);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleProceedToPayment = async () => {
    try {
      // Create PaymentIntent on the backend
      const res = await api.post('/payments/create-intent', { auctionId: id });
      setClientSecret(res.data.data.clientSecret);
      setShowCheckout(true);
    } catch (err) {
      console.error('Failed to initialize payment:', err);
      alert('Failed to initialize payment gateway.');
    }
  };

  if (loading) return <div className="pt-20"><Loader /></div>;
  if (error) return (
    <div className="pt-20 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-4">{error}</h2>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Media & Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Main Image View */}
          <GlassCard className="overflow-hidden relative aspect-video bg-black/40">
            {auction.imageUrl ? (
              <img 
                src={auction.imageUrl} 
                alt={auction.title} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                No Image Available
              </div>
            )}
            
            {/* Live Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {auction.status === 'active' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-fast"></div>
                  <span className="text-xs font-bold text-red-100 tracking-wide uppercase">Live Auction</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-white/10 backdrop-blur-md">
                  <span className="text-xs font-bold text-text-muted tracking-wide uppercase">Ended</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                <Eye className="w-3.5 h-3.5 text-neon-secondary" />
                <span className="text-xs font-medium text-white">{watchers} Watching</span>
              </div>
            </div>
          </GlassCard>

          {/* Asset Info */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{auction.title}</h1>
                  <p className="text-text-muted text-lg leading-relaxed">
                    {auction.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={auction.seller?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=Seller`}
                      alt="Seller" 
                      className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10" 
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Verified Seller</p>
                      <p className="text-xs text-text-muted">{auction.seller?.fullName}</p>
                    </div>
                  </div>
                  
                  {auction.requiresPaymentVerification && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">Stripe Protected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Interaction & Bidding */}
        <div className="space-y-6 flex flex-col">
          {/* Status & Timer Card */}
          <GlassCard className="p-6 relative overflow-hidden">
            {auction.status === 'active' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-primary via-neon-secondary to-neon-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
            )}
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-text-muted mb-1">
                  {auction.status === 'active' ? 'Ends in' : 'Auction Ended'}
                </p>
                {auction.status === 'active' ? (
                  <Countdown 
                    targetDate={auction.endTime} 
                    onExpire={() => setAuction(prev => ({...prev, status: 'ended'}))} 
                  />
                ) : (
                  <div className="text-3xl font-mono font-bold text-white">00:00:00:00</div>
                )}
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <p className="text-sm font-medium text-text-muted mb-2">Current Highest Bid</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    ${parseFloat(auction.currentHighestBid || auction.startingPrice).toLocaleString()}
                  </span>
                  <span className="text-sm text-neon-secondary font-medium">USD</span>
                </div>
              </div>

              {auction.status === 'active' ? (
                <BidBox 
                  currentBid={parseFloat(auction.currentHighestBid || auction.startingPrice)}
                  minIncrement={parseFloat(auction.minIncrement)}
                  onSubmit={handlePlaceBid}
                  disabled={!connected}
                />
              ) : (
                <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 text-center">
                  <p className="text-text-primary font-medium">Bidding is closed</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Live Bid History */}
          <div className="flex-1 min-h-[400px]">
            <BidHistory bids={bids} currentHighest={parseFloat(auction.currentHighestBid || auction.startingPrice)} />
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md relative"
            >
              <GlassCard className="p-8 text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-400/20 flex items-center justify-center mb-6">
                  <span className="text-4xl">🏆</span>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">Auction Ended!</h2>
                
                {winner ? (
                  <div className="space-y-4">
                    <p className="text-text-muted">The winning bid was</p>
                    <div className="text-4xl font-bold text-emerald-400">
                      ${parseFloat(auction.currentHighestBid).toLocaleString()}
                    </div>
                    
                    <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 flex items-center justify-center gap-3">
                      <img src={winner.avatarUrl || winner.avatar} alt="Winner" className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-white">{winner.fullName || winner.name}</span>
                    </div>

                    {user?.id === (winner.id || winner.bidderId) ? (
                      <div className="mt-8 space-y-3">
                        {!showCheckout ? (
                          <>
                            <p className="text-sm font-medium text-emerald-400">Congratulations! You won this auction.</p>
                            <Button onClick={handleProceedToPayment} className="w-full h-12 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                              Proceed to Payment
                            </Button>
                          </>
                        ) : (
                          clientSecret && (
                            <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
                              <div className="text-left mt-4">
                                <CheckoutForm 
                                  auctionId={id} 
                                  onSuccess={() => {
                                    setShowCheckout(false);
                                    setShowWinnerModal(false);
                                    navigate('/dashboard'); // Or to an invoice page
                                  }} 
                                />
                                <Button variant="secondary" onClick={() => setShowCheckout(false)} className="w-full mt-4">
                                  Cancel
                                </Button>
                              </div>
                            </Elements>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="mt-6">
                        <Button variant="secondary" onClick={() => setShowWinnerModal(false)} className="w-full">
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-text-muted">This auction ended with no bids.</p>
                    <Button variant="secondary" onClick={() => setShowWinnerModal(false)} className="w-full mt-4">
                      Close
                    </Button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
