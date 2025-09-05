// Data storage utilities for coupon management
import { Coupon, CouponFilters, CouponStats } from './types';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and files exist
async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if coupons file exists, create if not
    try {
      await fs.access(COUPONS_FILE);
    } catch {
      await fs.writeFile(COUPONS_FILE, JSON.stringify([]));
    }
    
    // Check if users file exists, create if not
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

// Coupon storage functions
export async function getAllCoupons(): Promise<Coupon[]> {
  await ensureDataFiles();
  try {
    const data = await fs.readFile(COUPONS_FILE, 'utf-8');
    return JSON.parse(data) as Coupon[];
  } catch {
    return [];
  }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  const coupons = await getAllCoupons();
  return coupons.find(c => c.id === id) || null;
}

export async function getFilteredCoupons(filters: CouponFilters): Promise<Coupon[]> {
  let coupons = await getAllCoupons();
  
  // Filter by status first (remove expired unless specifically requested)
  if (filters.status !== 'all') {
    coupons = coupons.filter(c => c.status === (filters.status || 'available'));
  }
  
  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    coupons = coupons.filter(c => 
      c.title.toLowerCase().includes(searchTerm) ||
      c.store.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Category filter
  if (filters.category && filters.category !== 'all') {
    coupons = coupons.filter(c => c.category === filters.category);
  }
  
  // Store filter
  if (filters.store && filters.store !== 'all') {
    coupons = coupons.filter(c => c.store.toLowerCase().includes(filters.store!.toLowerCase()));
  }
  
  // Discount range filter
  if (filters.minDiscount !== undefined || filters.maxDiscount !== undefined) {
    coupons = coupons.filter(c => {
      const discount = parseFloat(c.discountValue);
      const min = filters.minDiscount || 0;
      const max = filters.maxDiscount || Infinity;
      return discount >= min && discount <= max;
    });
  }
  
  // Sort results
  switch (filters.sortBy) {
    case 'newest':
      coupons.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      break;
    case 'expiry':
      coupons.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      break;
    case 'discount':
      coupons.sort((a, b) => parseFloat(b.discountValue) - parseFloat(a.discountValue));
      break;
    case 'rating':
      coupons.sort((a, b) => b.rating - a.rating);
      break;
    default:
      coupons.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }
  
  return coupons;
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  const coupons = await getAllCoupons();
  const existingIndex = coupons.findIndex(c => c.id === coupon.id);
  
  if (existingIndex >= 0) {
    coupons[existingIndex] = coupon;
  } else {
    coupons.push(coupon);
  }
  
  await fs.writeFile(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const coupons = await getAllCoupons();
  const filteredCoupons = coupons.filter(c => c.id !== id);
  
  if (filteredCoupons.length < coupons.length) {
    await fs.writeFile(COUPONS_FILE, JSON.stringify(filteredCoupons, null, 2));
    return true;
  }
  
  return false;
}

export async function claimCoupon(couponId: string, claimedBy: string): Promise<boolean> {
  const coupon = await getCouponById(couponId);
  
  if (!coupon || coupon.status !== 'available') {
    return false;
  }
  
  coupon.status = 'claimed';
  coupon.claimedBy = claimedBy;
  coupon.claimedAt = new Date().toISOString();
  
  await saveCoupon(coupon);
  return true;
}

export async function unclaimCoupon(couponId: string): Promise<boolean> {
  const coupon = await getCouponById(couponId);
  
  if (!coupon || coupon.status !== 'claimed') {
    return false;
  }
  
  coupon.status = 'available';
  coupon.claimedBy = undefined;
  coupon.claimedAt = undefined;
  
  await saveCoupon(coupon);
  return true;
}

// Cleanup expired coupons
export async function cleanupExpiredCoupons(): Promise<number> {
  const coupons = await getAllCoupons();
  const now = new Date();
  let cleanedCount = 0;
  
  const updatedCoupons = coupons.filter(coupon => {
    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < now && coupon.status !== 'expired') {
      coupon.status = 'expired';
      cleanedCount++;
      return true; // Keep but mark as expired
    }
    return true;
  });
  
  if (cleanedCount > 0) {
    await fs.writeFile(COUPONS_FILE, JSON.stringify(updatedCoupons, null, 2));
  }
  
  return cleanedCount;
}

// Get coupon statistics
export async function getCouponStats(): Promise<CouponStats> {
  const coupons = await getAllCoupons();
  
  const stats: CouponStats = {
    total: coupons.length,
    available: coupons.filter(c => c.status === 'available').length,
    claimed: coupons.filter(c => c.status === 'claimed').length,
    expired: coupons.filter(c => c.status === 'expired').length,
    categoryCounts: {}
  };
  
  // Count by categories
  coupons.forEach(coupon => {
    stats.categoryCounts[coupon.category] = (stats.categoryCounts[coupon.category] || 0) + 1;
  });
  
  return stats;
}

// Generate unique ID for new coupons
export function generateCouponId(): string {
  return 'coupon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Validate coupon data
export function validateCouponData(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  
  const title = data.title as string;
  const store = data.store as string;
  const category = data.category as string;
  const discountValue = data.discountValue as string;
  const expiryDate = data.expiryDate as string;
  const description = data.description as string;
  const postedBy = data.postedBy as string;
  
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!store || store.trim().length < 2) {
    errors.push('Store name must be at least 2 characters long');
  }
  
  if (!category) {
    errors.push('Category is required');
  }
  
  if (!discountValue || discountValue.trim().length === 0) {
    errors.push('Discount value is required');
  }
  
  if (!expiryDate) {
    errors.push('Expiry date is required');
  } else {
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj <= new Date()) {
      errors.push('Expiry date must be in the future');
    }
  }
  
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!postedBy || postedBy.trim().length < 2) {
    errors.push('Posted by field is required');
  }
  
  return errors;
}