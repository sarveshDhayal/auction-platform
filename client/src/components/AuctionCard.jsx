import { Link } from 'react-router-dom';
import { Clock, Users, ArrowUpRight } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';

const AuctionCard = ({ auction }) => {
  return (
    <GlassCard hoverEffect className="group p-4 flex flex-col h-full">
      <div className="relative rounded-xl overflow-hidden mb-4 aspect-video">
        <img 
          src={auction.image} 
          alt={auction.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          {auction.status === 'live' && (
            <div className="flex items-center gap-1.5 bg-danger/90 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg shadow-danger/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white line-clamp-1">{auction.title}</h3>
        </div>
        
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
          {auction.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div>
            <p className="text-xs text-text-secondary mb-1">Current Bid</p>
            <p className="text-lg font-bold text-success">${auction.currentBid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Time Left
            </p>
            <p className="text-sm font-semibold text-warning">{auction.timeLeft}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Users className="w-4 h-4" />
            <span>{auction.watchers} watching</span>
          </div>
          <Link 
            to={`/auction/${auction.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors"
          >
            Join Room <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

export default AuctionCard;
