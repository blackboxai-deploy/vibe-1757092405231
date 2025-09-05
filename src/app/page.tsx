'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { SearchFilters } from '@/components/SearchFilters';
import { CouponGrid } from '@/components/CouponGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coupon, CouponFilters } from '@/lib/types';
import Link from 'next/link';

export default function HomePage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CouponFilters>({
    status: 'available',
    sortBy: 'newest'
  });
  const [currentUser] = useState('Guest User'); // In real app, get from auth context

  // Fetch coupons based on current filters
  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      // Build query parameters
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.store) searchParams.set('store', filters.store);
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.minDiscount) searchParams.set('minDiscount', filters.minDiscount.toString());
      if (filters.maxDiscount) searchParams.set('maxDiscount', filters.maxDiscount.toString());

      const response = await fetch(`/api/coupons?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      
      if (data.success) {
        setCoupons(data.data || []);
      } else {
        console.error('API Error:', data.error);
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Handle coupon claim
  const handleClaim = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'claim',
          claimedBy: currentUser
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim coupon');
      }

      // Refresh coupons list
      await fetchCoupons();
    } catch (error) {
      console.error('Error claiming coupon:', error);
      throw error;
    }
  };

  // Handle coupon unclaim
  const handleUnclaim = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unclaim'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unclaim coupon');
      }

      // Refresh coupons list
      await fetchCoupons();
    } catch (error) {
      console.error('Error unclaiming coupon:', error);
      throw error;
    }
  };

  // Handle coupon delete
  const handleDelete = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      // Refresh coupons list
      await fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  };

  // Trigger cleanup
  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Cleanup completed: ${data.cleanedCount} expired coupons updated`);
        await fetchCoupons(); // Refresh list
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Cleanup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentUser={currentUser} couponCount={coupons.length} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Coupons, Save Money Together
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Turn your unused coupons into someone else&apos;s savings! Join our community of smart shoppers sharing deals and discovering great discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/post-coupon">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Share a Coupon
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleCleanup}>
              Cleanup Expired
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter(c => c.status === 'available').length}
                </div>
                <div className="text-sm text-gray-600">Available Coupons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {coupons.filter(c => c.status === 'claimed').length}
                </div>
                <div className="text-sm text-gray-600">Recently Claimed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(coupons.map(c => c.store)).size}
                </div>
                <div className="text-sm text-gray-600">Different Stores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {coupons.reduce((acc, c) => {
                    const discount = parseFloat(c.discountValue) || 0;
                    return acc + discount;
                  }, 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total Savings Shared</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          isLoading={isLoading}
          totalCount={coupons.length}
        />

        {/* Coupons Grid */}
        <CouponGrid
          coupons={coupons}
          isLoading={isLoading}
          currentUser={currentUser}
          onClaim={handleClaim}
          onUnclaim={handleUnclaim}
          onDelete={handleDelete}
        />

        {/* Call to Action */}
        {!isLoading && coupons.length === 0 && filters.status === 'available' && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              No coupons available yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to help the community save money by sharing your unused coupons!
            </p>
            <Link href="/post-coupon">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Post the First Coupon
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              🎫 <strong>CouponShare</strong> - Community-driven coupon sharing platform
            </p>
            <p className="text-sm">
              Help others save money by sharing coupons you won&apos;t use. Every coupon shared makes a difference!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}