import { prisma } from '../config/db.js';
import { registerAuctionTimer } from '../services/timerService.js';

/**
 * @desc    Create new auction
 * @route   POST /api/auctions
 * @access  Private
 */
export const createAuction = async (req, res) => {
  try {
    const { 
      title, description, category, startingPrice, minIncrement, 
      startTime, endTime, requiresPaymentVerification 
    } = req.body;

    // The image file is uploaded via Multer/Cloudinary
    const imageUrl = req.file ? req.file.path : null;

    if (!title || !description || !startingPrice || !endTime) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const start = new Date(startTime || Date.now());
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ status: 'error', message: 'End time must be after start time' });
    }

    const newAuction = await prisma.auction.create({
      data: {
        sellerId: req.user.id,
        title,
        description,
        category,
        startingPrice: parseFloat(startingPrice),
        currentHighestBid: parseFloat(startingPrice), // Starts at starting price
        minIncrement: parseFloat(minIncrement),
        startTime: start,
        endTime: end,
        imageUrl,
        requiresPaymentVerification: requiresPaymentVerification === 'true' || requiresPaymentVerification === true,
        status: start <= new Date() ? 'active' : 'draft', // Auto active if start time is past
      }
    });

    // If active, register timer in Redis
    if (newAuction.status === 'active') {
      await registerAuctionTimer(newAuction.id, end.getTime());
    }

    res.status(201).json({
      status: 'success',
      data: newAuction
    });

  } catch (error) {
    console.error('Create Auction Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create auction' });
  }
};

/**
 * @desc    Get all active auctions (with search, filter, pagination)
 * @route   GET /api/auctions
 * @access  Public
 */
export const getAuctions = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10, status = 'active' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build the query
    const whereClause = {
      status: status, // Only fetch active by default
    };

    if (category) whereClause.category = category;
    
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive' // Postgres case-insensitive
      };
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where: whereClause,
        include: {
          seller: { select: { fullName: true, avatarUrl: true } }
        },
        orderBy: { endTime: 'asc' }, // Ending soonest first
        skip,
        take: parseInt(limit)
      }),
      prisma.auction.count({ where: whereClause })
    ]);

    res.status(200).json({
      status: 'success',
      results: auctions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: auctions
    });

  } catch (error) {
    console.error('Get Auctions Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch auctions' });
  }
};

/**
 * @desc    Get single auction by ID (Includes Bid History)
 * @route   GET /api/auctions/:id
 * @access  Public (Protected conditionally on frontend)
 */
export const getAuctionById = async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
        winner: { select: { id: true, fullName: true, avatarUrl: true } },
        bids: {
          orderBy: { amount: 'desc' },
          include: {
            bidder: { select: { id: true, fullName: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    res.status(200).json({
      status: 'success',
      data: auction
    });
  } catch (error) {
    console.error('Get Auction By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch auction details' });
  }
};

/**
 * @desc    Get user's own auctions (Dashboard)
 * @route   GET /api/auctions/user/my-auctions
 * @access  Private
 */
export const getUserAuctions = async (req, res) => {
  try {
    const auctions = await prisma.auction.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      results: auctions.length,
      data: auctions
    });
  } catch (error) {
    console.error('Get User Auctions Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch your auctions' });
  }
};
