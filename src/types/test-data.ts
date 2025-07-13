import { AuthUser } from './auth';
import { INFLUENCER_THRESHOLD } from '../utils/constants';

// Test users for development
export const TEST_USERS: Record<string, AuthUser> = {
  guest: {
    id: 'guest',
    email: 'guest@example.com',
    name: 'Guest User',
    role: 'guest',
    followers: 0,
    following: 0,
    isInfluencer: false,
    verified: false,
    createdAt: new Date(),
  },
  testcustomer: {
    id: 'test-customer',
    email: 'customer@test.com',
    name: 'Test Customer',
    role: 'customer',
    followers: 500,
    following: 250,
    isInfluencer: false,
    verified: true,
    createdAt: new Date(),
  },
  testinfluencer: {
    id: 'test-influencer',
    email: 'influencer@test.com',
    name: 'Test Influencer',
    role: 'customer',
    followers: INFLUENCER_THRESHOLD + 500, // 1500 followers
    following: 800,
    isInfluencer: true,
    verified: true,
    createdAt: new Date(),
  },
  testvendor: {
    id: 'test-vendor',
    email: 'vendor@test.com',
    name: 'Test Vendor',
    role: 'vendor',
    followers: 2000,
    following: 100,
    isInfluencer: true, // vendors can also be influencers
    verified: true,
    createdAt: new Date(),
  },
};

export const TEST_CREDENTIALS = {
  'customer@test.com': 'password123',
  'influencer@test.com': 'password123',
  'vendor@test.com': 'password123',
};