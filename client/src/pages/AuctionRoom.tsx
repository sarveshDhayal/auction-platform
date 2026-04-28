import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, AlertTriangle, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

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
import { Auction, Bid, User } from '../types';

export default function AuctionRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const [watchers, setWatchers] = useState<number>(1);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [winner, setWinner] = useState<User | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState<boolean>(false);

  const stripePromise = loadStripe((import.meta.env.VITE_STRIPE_PUBLIC_KEY as string) || 'pk_test_placeholder');

  const { data: auctionData, isLoading, error } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const response = await api.get<any>(`/auctions/${id}`);
      const data = response.data.data;
      
      const formattedBids: Bid[] = (data.bids || []).map((b: any) => ({
        id: b.id,
        user: { name: b.bidder.fullName, avatar: b.bidder.avatarUrl, id: b.bidder.id },
        amount: parseFloat(b.amount),
        time: b.createdAt
      }));

      return {
        auction: {
          id: data.id,
          title: data.title,
          description: data.description,
          image: data.imageUrl,
          currentHighestBid: parseFloat(data.currentHighestBid || data.startingPrice),
          minIncrement: data.minIncrement,
          endTime: data.endTime,
          status: data.status,
          seller: data.seller,
          category: data.category
        },
        bids: formattedBids,
        winner: data.winner
      };
    },
    enabled: !!id
  });

  const auction = auctionData?.auction;
  const bids = auctionData?.bids || [];

  const triggerConfetti = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  useEffect(() => {
    if (!socket || !connected || !id) return;

    socket.emit('join_auction', { auctionId: id });

    socket.on('watchers_update', (count: number) => {
      setWatchers(count);
    });

    socket.on('new_bid', (newBid: Bid) => {
      queryClient.setQueryData(['auction', id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          auction: { ...oldData.auction, currentHighestBid: newBid.amount },
          bids: [newBid, ...oldData.bids]
        };
      });
      
      if (newBid.user.id !== user?.id) {
        toast(`${newBid.user.name} placed a new bid: $${newBid.amount.toLocaleString()}`, {
          icon: '💰',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    });

    socket.on('outbid', (data: { auctionTitle: string, newHighestBid: number }) => {
      toast.error(`You've been outbid on ${data.auctionTitle}! New high bid: $${data.newHighestBid.toLocaleString()}`, {
        duration: 5000,
        icon: '⚠️',
      });
    });

    socket.on('auction_ended', (data: { winner: User }) => {
      queryClient.invalidateQueries({ queryKey: ['auction', id] });
      setWinner(data.winner);
      setShowWinnerModal(true);
      if (data.winner.id === user?.id) {
        triggerConfetti();
        toast.success('Congratulations! You won the auction!', { duration: 10000 });
      }
    });

    return () => {
      socket.emit('leave_auction', { auctionId: id });
      socket.off('watchers_update');
      socket.off('new_bid');
      socket.off('outbid');
      socket.off('auction_ended');
    };
  }, [socket, connected, id, user?.id, queryClient, triggerConfetti]);

  useEffect(() => {
    if (auction?.status === 'ended' && auctionData?.winner) {
      setWinner(auctionData.winner);
      setShowWinnerModal(true);
    }
  }, [auction?.status, auctionData?.winner]);

  const handlePlaceBid = async (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !connected) return reject(new Error('Live connection lost'));

      socket.emit('place_bid', { auctionId: id, amount }, (response: any) => {
        if (response.status === 'success') {
          toast.success('Bid placed successfully!');
          resolve();
        } else {
          toast.error(response.message);
          reject(new Error(response.message));
        }
      });
    });
  };

  const handleProceedToPayment = async () => {
    try {
      const res = await api.post<any>('/payments/create-intent', { auctionId: id });
      setClientSecret(res.data.data.clientSecret);
      setShowCheckout(true);
    } catch (err) {
      console.error('Failed to initialize payment:', err);
      toast.error('Failed to initialize payment gateway.');
    }
  };

  if (isLoading) return <div className="pt-20"><Loader /></div>;
  if (error || !auction) return (
    <div className="pt-20 text-center px-4">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-4">{(error as any)?.message || 'Auction not found'}</h2>
      <Button onClick={() => navigate('/')} className="px-6 py-2" isLoading={false}>Back to Dashboard</Button>
    </div>
  );

  const auctionImage = (auction as any).image || (auction as any).imageUrl;
  const currentHighestBid = (auction as any).currentHighestBid || 0;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="overflow-hidden relative aspect-video bg-black/40 flex items-center justify-center">
            {auctionImage ? (
              <motion.img
                key={auctionImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                src={auctionImage}
                alt={auction.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-text-secondary">No Image Available</div>
            )}

            <div className="absolute top-4 left-4 flex gap-2">
              {auction.status === 'active' || (auction.status as string) === 'live' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger/20 border border-danger/50 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">Live Auction</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  <span className="text-xs font-bold text-text-secondary tracking-wide uppercase">Ended</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-white">{watchers} Watching</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{auction.title}</h1>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              {auction.description}
            </p>
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <img
                src={(auction as any).seller?.avatarUrl || `https://ui-avatars.com/api/?name=${(auction as any).seller?.fullName}`}
                alt="Seller"
                className="w-12 h-12 rounded-full border border-white/10"
              />
              <div>
                <p className="text-sm font-medium text-white">Verified Seller</p>
                <p className="text-xs text-text-secondary">{(auction as any).seller?.fullName}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">
                  {auction.status === 'active' || (auction.status as string) === 'live' ? 'Time Remaining' : 'Auction Status'}
                </p>
                {auction.status === 'active' || (auction.status as string) === 'live' ? (
                  <Countdown
                    targetDate={auction.endTime}
                    onEnd={() => queryClient.invalidateQueries({ queryKey: ['auction', id] })}
                  />
                ) : (
                  <div className="text-2xl font-bold text-white">Bidding Closed</div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-sm font-medium text-text-secondary mb-2">Current Bid</p>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentHighestBid}
                    initial={{ scale: 1.1, color: '#3B82F6' }}
                    animate={{ scale: 1, color: '#FFFFFF' }}
                    className="text-4xl font-bold text-white"
                  >
                    ${currentHighestBid.toLocaleString()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {auction.status === 'active' || (auction.status as string) === 'live' ? (
                <BidBox
                  currentBid={currentHighestBid}
                  minIncrement={(auction as any).minIncrement || 0}
                  onPlaceBid={handlePlaceBid}
                  isEnded={auction.status === 'ended' || (auction.status as string) === 'closed'}
                  disabled={!connected}
                />
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-text-secondary">
                  Auction has ended
                </div>
              )}
            </div>
          </GlassCard>

          <BidHistory bids={bids} />
        </div>
      </div>

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
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                  <span className="text-4xl">🏆</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Auction Ended!</h2>

                {winner ? (
                  <div className="space-y-4">
                    <p className="text-text-secondary">Winner: <span className="text-white font-bold">{winner.name || (winner as any).fullName}</span></p>
                    <div className="text-4xl font-bold text-success">
                      ${currentHighestBid.toLocaleString()}
                    </div>

                    {user?.id === winner.id ? (
                      <div className="mt-8 space-y-4">
                        {!showCheckout ? (
                          <>
                            <p className="text-sm text-success font-medium">You won! Please proceed to secure payment.</p>
                            <Button onClick={handleProceedToPayment} className="w-full py-3" isLoading={false}>
                              Pay Now
                            </Button>
                          </>
                        ) : (
                          clientSecret && (
                            <Elements options={{ clientSecret }} stripe={stripePromise}>
                              <CheckoutForm
                                onSuccess={() => {
                                  setShowCheckout(false);
                                  setShowWinnerModal(false);
                                  navigate('/');
                                }}
                              />
                            </Elements>
                          )
                        )}
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setShowWinnerModal(false)} className="w-full mt-6 py-2" isLoading={false}>
                        Close
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-text-secondary">No bids were placed for this item.</p>
                    <Button variant="outline" onClick={() => setShowWinnerModal(false)} className="w-full mt-6 py-2" isLoading={false}>
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
