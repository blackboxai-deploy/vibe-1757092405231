'use client';

import { CouponFilters, COUPON_CATEGORIES } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SearchFiltersProps {
  filters: CouponFilters;
  onFiltersChange: (filters: CouponFilters) => void;
  isLoading?: boolean;
  totalCount?: number;
}

export function SearchFilters({ 
  filters, 
  onFiltersChange, 
  isLoading = false,
  totalCount = 0 
}: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch.trim() || undefined });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      status: 'available',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = !!(
    filters.search || 
    (filters.category && filters.category !== 'all') ||
    (filters.store && filters.store !== 'all') ||
    filters.minDiscount ||
    filters.maxDiscount
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search coupons by title, store, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Category Filter */}
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                category: value === 'all' ? undefined : value 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COUPON_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'available'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                status: value as 'available' | 'claimed' | 'expired' | 'all'
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                sortBy: value as 'newest' | 'expiry' | 'discount' | 'rating'
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="expiry">Expiring Soon</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Min Discount */}
          <Input
            type="number"
            placeholder="Min discount"
            value={filters.minDiscount || ''}
            onChange={(e) => 
              onFiltersChange({ 
                ...filters, 
                minDiscount: e.target.value ? parseFloat(e.target.value) : undefined 
              })
            }
            min="0"
          />

          {/* Max Discount */}
          <Input
            type="number"
            placeholder="Max discount"
            value={filters.maxDiscount || ''}
            onChange={(e) => 
              onFiltersChange({ 
                ...filters, 
                maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined 
              })
            }
            min="0"
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={isLoading}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {filters.search && (
              <Badge variant="secondary">
                Search: &quot;{filters.search}&quot;
              </Badge>
            )}
            
            {filters.category && filters.category !== 'all' && (
              <Badge variant="secondary">
                Category: {filters.category}
              </Badge>
            )}
            
            {filters.store && filters.store !== 'all' && (
              <Badge variant="secondary">
                Store: {filters.store}
              </Badge>
            )}
            
            {filters.minDiscount && (
              <Badge variant="secondary">
                Min: {filters.minDiscount}%
              </Badge>
            )}
            
            {filters.maxDiscount && (
              <Badge variant="secondary">
                Max: {filters.maxDiscount}%
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            {isLoading ? 'Loading...' : `Found ${totalCount} coupon${totalCount !== 1 ? 's' : ''}`}
          </span>
          
          {filters.status === 'available' && (
            <span className="text-green-600">
              Showing available coupons only
            </span>
          )}
        </div>
      </div>
    </div>
  );
}