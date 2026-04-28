export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  status?: string;
  createdAt?: string;
}

export interface Bid {
  id: string;
  amount: number;
  time: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  currentHighestBid: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  image?: string; // For mock data compatibility
  status: 'active' | 'ended' | 'draft' | 'live' | 'closed';
  sellerId: string;
  seller: {
    fullName: string;
    avatarUrl?: string;
  };
  winnerId?: string;
  winner?: {
    fullName: string;
    avatarUrl?: string;
  };
  bids?: Bid[];
  requiresPaymentVerification?: boolean;
}

export interface Transaction {
  id: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  auction: Auction;
}
