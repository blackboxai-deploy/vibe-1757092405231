'use client';

import { Coupon } from '@/lib/types';
import { CouponCard } from './CouponCard';

interface CouponGridProps {
  coupons: Coupon[];
  isLoading?: boolean;
  currentUser?: string;
  onClaim?: (couponId: string) => void;
  onUnclaim?: (couponId: string) => void;
  onDelete?: (couponId: string) => void;
}

export function CouponGrid({ 
  coupons, 
  isLoading = false, 
  currentUser,
  onClaim,
  onUnclaim,
  onDelete
}: CouponGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-80">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">🎫</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No coupons found
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          Be the first to share a coupon with the community! Click &quot;Post Coupon&quot; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          currentUser={currentUser}
          onClaim={onClaim}
          onUnclaim={onUnclaim}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}