import { describe, it, expect } from 'vitest';
import { auctionSchema } from './index';

describe('Auction Schema Validation', () => {
  const validAuction = {
    title: 'Vintage Camera',
    description: 'A beautiful vintage camera in great condition.',
    category: 'Electronics',
    startingPrice: 100,
    minIncrement: 10,
    endTime: new Date(Date.now() + 86400000).toISOString(),
    requiresPaymentVerification: true
  };

  it('should validate a valid auction', () => {
    const result = auctionSchema.safeParse(validAuction);
    expect(result.success).toBe(true);
  });

  it('should fail if title is too short', () => {
    const result = auctionSchema.safeParse({ ...validAuction, title: 'ab' });
    expect(result.success).toBe(false);
  });

  it('should fail if startingPrice is negative', () => {
    const result = auctionSchema.safeParse({ ...validAuction, startingPrice: -10 });
    expect(result.success).toBe(false);
  });

  it('should fail if endTime is in the past', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = auctionSchema.safeParse({ ...validAuction, endTime: pastDate });
    expect(result.success).toBe(false);
  });
});
