import { prisma } from '../config/db.js';

/**
 * @desc    Get Platform Stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalAuctions, activeAuctions, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.auction.count(),
      prisma.auction.count({ where: { status: 'active' } }),
      prisma.transaction.findMany({ where: { status: 'completed' } })
    ]);

    const totalRevenue = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const completedTransactions = transactions.length;

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalAuctions,
        activeAuctions,
        totalRevenue,
        completedTransactions
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch platform stats' });
  }
};

/**
 * @desc    Manage Users (Get all users, Toggle Status)
 * @route   GET /api/admin/users
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'suspended', 'unverified'
    const { id } = req.params;

    if (!['active', 'suspended', 'unverified'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ status: 'success', message: `User status updated to ${status}`, data: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update user status' });
  }
};

/**
 * @desc    Manage Auctions (Delete fraudulent, Close manually)
 * @route   DELETE /api/admin/auctions/:id
 * @route   POST /api/admin/auctions/:id/close
 * @access  Private/Admin
 */
export const deleteFraudulentAuction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleting an auction cascades to bids, transactions, etc based on schema.
    await prisma.auction.delete({
      where: { id }
    });

    res.status(200).json({ status: 'success', message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete auction' });
  }
};

export const closeAuctionManually = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: { 
        status: 'ended',
        endTime: new Date() // Set end time to now
      }
    });

    // NOTE: In a real system, you might want to call processExpiredAuction manually here.
    // For this MVP, marking it ended hides it from active listings.

    res.status(200).json({ status: 'success', message: 'Auction closed manually', data: updatedAuction });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to close auction' });
  }
};
