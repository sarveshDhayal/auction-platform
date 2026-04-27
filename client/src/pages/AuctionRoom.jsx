// client/src/pages/AuctionRoom.jsx
import { useEffect, useState } from 'react';
import { useSocket }           from '../context/SocketContext';
import Countdown               from '../components/Countdown';
import BidHistory              from '../components/BidHistory';

export default function AuctionRoom({ auctionId }) {
  const socket = useSocket();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bidAmount, setBidAmount]       = useState('');
  const [bids, setBids]                 = useState([]);
  const [timeLeft, setTimeLeft]         = useState(null);
  const [ended, setEnded]               = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    socket.emit('join_auction', auctionId);

    socket.on('auction_state', (state) => {
      setCurrentPrice(state.current_price);
    });

    socket.on('bid_history', setBids);

    socket.on('new_bid', (bid) => {
      setCurrentPrice(bid.amount);
      setBids(prev => [bid, ...prev]);
    });

    socket.on('timer_tick', ({ remaining }) => setTimeLeft(remaining));

    socket.on('bid_error', setError);

    socket.on('auction_ended', ({ winner, amount }) => {
      setEnded(true);
      // show winner banner
    });

    return () => socket.off(); // cleanup on unmount
  }, [auctionId]);

  const placeBid = () => {
    if (!bidAmount) return;
    socket.emit('place_bid', {
      auctionId,
      userId: user.id, // Ensure user object is passed down or accessed via context
      amount: parseFloat(bidAmount),
      paymentMethodId: user.defaultPaymentMethod, // saved Stripe PM
    });
    setBidAmount('');
    setError('');
  };

  return (
    <div>
      <Countdown milliseconds={timeLeft} />
      <h2>Current price: ${currentPrice}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!ended && (
        <>
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            placeholder={`Min $${currentPrice + 1}`}
          />
          <button onClick={placeBid}>Place Bid</button>
        </>
      )}
      <BidHistory bids={bids} />
    </div>
  );
}
