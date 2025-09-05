// Core types for the coupon sharing community

export interface Coupon {
  id: string;
  title: string;
  store: string;
  category: string;
  discountValue: string;
  discountType: 'percentage' | 'fixed' | 'other';
  expiryDate: string; // ISO string
  description: string;
  code?: string;
  imageUrl?: string;
  postedBy: string; // Username/ID
  postedAt: string; // ISO string
  claimedBy?: string;
  claimedAt?: string; // ISO string
  status: 'available' | 'claimed' | 'expired';
  rating: number;
  ratingCount: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  joinedAt: string;
  postedCoupons: string[]; // Coupon IDs
  claimedCoupons: string[]; // Coupon IDs
  rating: number;
}

export interface CouponFilters {
  search?: string;
  category?: string;
  store?: string;
  status?: 'available' | 'claimed' | 'expired' | 'all';
  sortBy?: 'newest' | 'expiry' | 'discount' | 'rating';
  minDiscount?: number;
  maxDiscount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CouponStats {
  total: number;
  available: number;
  claimed: number;
  expired: number;
  categoryCounts: Record<string, number>;
}

export const COUPON_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Travel',
  'Electronics',
  'Fashion',
  'Health & Beauty',
  'Sports & Fitness',
  'Home & Garden',
  'Education',
  'Other'
] as const;

export type CouponCategory = typeof COUPON_CATEGORIES[number];

export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount ($)' },
  { value: 'other', label: 'Other (e.g., BOGO)' }
] as const;

// Form validation schemas
export interface CouponFormData {
  title: string;
  store: string;
  category: string;
  discountValue: string;
  discountType: 'percentage' | 'fixed' | 'other';
  expiryDate: string;
  description: string;
  code?: string;
  postedBy: string;
}

export interface ClaimCouponData {
  couponId: string;
  claimedBy: string;
}

export interface RateCouponData {
  couponId: string;
  rating: number; // 1-5
  userId: string;
}