// Basic type exports
export * from './auth';
export * from './products';
export * from './orders';
export * from './shops';
export * from './api';
export * from './test-data';

// Re-export main types for convenience
export type { AuthUser as User } from './auth';
export type { Shop } from './products';
export type { Product } from './products';

// Influencer threshold constant
export const INFLUENCER_THRESHOLD = 1000;