'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { CouponGrid } from '@/components/CouponGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coupon } from '@/lib/types';

export default function ProfilePage() {
  const [currentUser] = useState('Guest User'); // In real app, get from auth context
  const [postedCoupons, setPostedCoupons] = useState<Coupon[]>([]);
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's coupons
  const fetchUserCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all coupons and filter by user
      const response = await fetch('/api/coupons?status=all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      
      if (data.success) {
        const allCoupons = data.data || [];
        
        // Separate posted vs claimed coupons
        const posted = allCoupons.filter((coupon: Coupon) => 
          coupon.postedBy === currentUser
        );
        
        const claimed = allCoupons.filter((coupon: Coupon) => 
          coupon.claimedBy === currentUser
        );
        
        setPostedCoupons(posted);
        setClaimedCoupons(claimed);
      } else {
        console.error('API Error:', data.error);
        setPostedCoupons([]);
        setClaimedCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      setPostedCoupons([]);
      setClaimedCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserCoupons();
  }, [fetchUserCoupons]);

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
      await fetchUserCoupons();
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
      await fetchUserCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  };

  // Calculate stats
  const stats = {
    totalPosted: postedCoupons.length,
    availablePosted: postedCoupons.filter(c => c.status === 'available').length,
    claimedPosted: postedCoupons.filter(c => c.status === 'claimed').length,
    expiredPosted: postedCoupons.filter(c => c.status === 'expired').length,
    totalClaimed: claimedCoupons.length,
    totalSavings: claimedCoupons.reduce((acc, coupon) => {
      const discount = parseFloat(coupon.discountValue) || 0;
      return acc + discount;
    }, 0)
  };

  return (
    <div className="min-h-screen">
      <Navigation currentUser={currentUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 mb-6">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser}! 👋
            </h1>
            <p className="text-green-100">
              Here&apos;s your coupon sharing activity and impact on the community
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-center">Coupons Posted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center text-green-600">
                {stats.totalPosted}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-center">Still Available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center text-blue-600">
                {stats.availablePosted}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-center">Coupons Claimed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center text-purple-600">
                {stats.totalClaimed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-center">Total Savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center text-orange-600">
                ${stats.totalSavings.toFixed(0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Impact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌟 Your Community Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold">{stats.claimedPosted} People Helped</div>
                <div className="text-sm text-gray-600">
                  Your posted coupons have been claimed by others
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold">Community Saver</div>
                <div className="text-sm text-gray-600">
                  You&apos;ve contributed to the sharing economy
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">🤝</div>
                <div className="font-semibold">Active Member</div>
                <div className="text-sm text-gray-600">
                  {stats.totalPosted > 0 ? 'Thanks for sharing with the community!' : 'Start sharing to make an impact!'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coupons Tabs */}
        <Tabs defaultValue="posted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posted" className="flex items-center gap-2">
              Posted by You
              <Badge variant="secondary">{stats.totalPosted}</Badge>
            </TabsTrigger>
            <TabsTrigger value="claimed" className="flex items-center gap-2">
              Your Claims
              <Badge variant="secondary">{stats.totalClaimed}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posted" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupons You&apos;ve Shared</CardTitle>
                <CardDescription>
                  Manage the coupons you&apos;ve posted to the community
                  {stats.availablePosted > 0 && (
                    <span className="ml-2">
                      <Badge variant="outline" className="text-green-600">
                        {stats.availablePosted} still available
                      </Badge>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading your posted coupons...</div>
                ) : postedCoupons.length > 0 ? (
                  <CouponGrid
                    coupons={postedCoupons}
                    currentUser={currentUser}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No coupons posted yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Share your unused coupons to help others save money!
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/post-coupon'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Post Your First Coupon
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claimed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupons You&apos;ve Claimed</CardTitle>
                <CardDescription>
                  Coupons you&apos;ve claimed from other community members
                  {stats.totalSavings > 0 && (
                    <span className="ml-2">
                      <Badge variant="outline" className="text-purple-600">
                        ~${stats.totalSavings.toFixed(0)} potential savings
                      </Badge>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading your claimed coupons...</div>
                ) : claimedCoupons.length > 0 ? (
                  <CouponGrid
                    coupons={claimedCoupons}
                    currentUser={currentUser}
                    onUnclaim={handleUnclaim}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No coupons claimed yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Browse available coupons to start saving money!
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                    >
                      Browse Coupons
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}