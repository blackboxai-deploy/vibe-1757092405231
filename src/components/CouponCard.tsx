'use client';

import { Coupon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface CouponCardProps {
  coupon: Coupon;
  onClaim?: (couponId: string) => void;
  onUnclaim?: (couponId: string) => void;
  onDelete?: (couponId: string) => void;
  currentUser?: string;
  showActions?: boolean;
}

export function CouponCard({ 
  coupon, 
  onClaim, 
  onUnclaim, 
  onDelete, 
  currentUser = 'Guest User',
  showActions = true 
}: CouponCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'claimed': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Shopping': 'bg-blue-100 text-blue-800', 
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Travel': 'bg-green-100 text-green-800',
      'Electronics': 'bg-gray-100 text-gray-800',
      'Fashion': 'bg-pink-100 text-pink-800',
      'Health & Beauty': 'bg-teal-100 text-teal-800',
      'Sports & Fitness': 'bg-red-100 text-red-800',
      'Home & Garden': 'bg-emerald-100 text-emerald-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-slate-100 text-slate-800'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDiscountValue = (value: string, type: string) => {
    switch (type) {
      case 'percentage':
        return `${value}% OFF`;
      case 'fixed':
        return `$${value} OFF`;
      default:
        return value;
    }
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const isOwner = currentUser === coupon.postedBy;
  const isClaimed = coupon.status === 'claimed';
  const canClaim = !isOwner && coupon.status === 'available' && !isExpired;
  const canUnclaim = coupon.claimedBy === currentUser && coupon.status === 'claimed';

  const handleClaim = async () => {
    if (!canClaim || !onClaim) return;
    
    setIsLoading(true);
    try {
      await onClaim(coupon.id);
      toast({
        title: 'Coupon Claimed!',
        description: 'You have successfully claimed this coupon.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to claim coupon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnclaim = async () => {
    if (!canUnclaim || !onUnclaim) return;
    
    setIsLoading(true);
    try {
      await onUnclaim(coupon.id);
      toast({
        title: 'Coupon Released',
        description: 'You have released this coupon for others to claim.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to release coupon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setIsLoading(true);
      try {
        await onDelete(coupon.id);
        toast({
          title: 'Coupon Deleted',
          description: 'Your coupon has been deleted successfully.',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete coupon. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className={`h-full flex flex-col transition-all duration-200 hover:shadow-lg ${
      isExpired ? 'opacity-60' : ''
    } ${isClaimed ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
              {coupon.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {coupon.store}
            </CardDescription>
          </div>
          <Badge 
            variant={getStatusBadgeVariant(coupon.status)}
            className="flex-shrink-0"
          >
            {coupon.status}
          </Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge 
            className={`text-xs ${getCategoryColor(coupon.category)}`}
            variant="secondary"
          >
            {coupon.category}
          </Badge>
          <div className="text-lg font-bold text-green-600">
            {formatDiscountValue(coupon.discountValue, coupon.discountType)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {coupon.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
              <Image 
                src={coupon.imageUrl} 
                alt={coupon.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <p className="text-sm text-gray-700 line-clamp-3">
            {coupon.description}
          </p>
          
          {coupon.code && (
            <div className="bg-gray-100 p-2 rounded-md">
              <span className="text-xs text-gray-600">Code:</span>
              <span className="font-mono font-bold ml-2 select-all">
                {coupon.code}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Expires: {formatDate(coupon.expiryDate)}</span>
            {coupon.rating > 0 && (
              <span>★ {coupon.rating} ({coupon.ratingCount})</span>
            )}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 border-t">
          <div className="w-full space-y-2">
            {canClaim && (
              <Button 
                onClick={handleClaim} 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Claiming...' : 'Claim Coupon'}
              </Button>
            )}
            
            {canUnclaim && (
              <Button 
                onClick={handleUnclaim}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Releasing...' : 'Release Coupon'}
              </Button>
            )}
            
            {isOwner && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleDelete}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
            
            {isClaimed && coupon.claimedBy && (
              <div className="text-xs text-gray-500 text-center">
                Claimed by {coupon.claimedBy === currentUser ? 'you' : coupon.claimedBy}
                {coupon.claimedAt && (
                  <span> on {formatDate(coupon.claimedAt)}</span>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}