import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Redis client
const redis = new Redis(REDIS_URL, {
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 50,
});

redis.on('connect', () => {
  // console.log('✅ Connected to Redis');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis Connection Error:', err.message);
});

export default redis;
