'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface NavigationProps {
  currentUser?: string;
  couponCount?: number;
}

export function Navigation({ currentUser = 'Guest User', couponCount = 0 }: NavigationProps) {
  const [stats, setStats] = useState({ available: 0, total: 0 });

  useEffect(() => {
    // Fetch coupon stats for display
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/coupons?stats=true');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              available: data.data.available,
              total: data.data.total
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [couponCount]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-green-600 rounded-lg p-2">
              <span className="text-white text-xl font-bold">🎫</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CouponShare
              </h1>
              <p className="text-xs text-gray-500">Community Coupon Exchange</p>
            </div>
          </Link>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <Badge variant="outline" className="mr-2">
                {stats.available} Available
              </Badge>
              <Badge variant="secondary">
                {stats.total} Total Coupons
              </Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Mobile stats */}
            <div className="md:hidden">
              <Badge variant="outline" className="text-xs">
                {stats.available}
              </Badge>
            </div>

            {/* Main Navigation */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Browse Coupons
                </Button>
              </Link>
              
              <Link href="/post-coupon">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Post Coupon
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <MobileMenu currentUser={currentUser} />
            </div>

            {/* User Info */}
            <div className="hidden lg:block text-sm text-gray-600">
              Welcome, <span className="font-medium">{currentUser}</span>
            </div>
          </div>
        </div>

        {/* Mobile Stats Bar */}
        <div className="md:hidden pb-3 border-t border-gray-100 pt-2">
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-gray-600">
              <Badge variant="outline" className="mr-1">
                {stats.available}
              </Badge>
              Available
            </span>
            <span className="text-gray-600">
              <Badge variant="secondary" className="mr-1">
                {stats.total}
              </Badge>
              Total
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Mobile Menu Component
function MobileMenu({ currentUser }: { currentUser: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-600 border-b">
                {currentUser}
              </div>
              
              <Link href="/" onClick={() => setIsOpen(false)}>
                <div className="px-4 py-2 text-sm hover:bg-gray-50">
                  Browse Coupons
                </div>
              </Link>
              
              <Link href="/post-coupon" onClick={() => setIsOpen(false)}>
                <div className="px-4 py-2 text-sm hover:bg-gray-50 text-green-600">
                  Post Coupon
                </div>
              </Link>
              
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <div className="px-4 py-2 text-sm hover:bg-gray-50">
                  Profile
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}