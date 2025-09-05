// API routes for individual coupon operations
import { NextRequest, NextResponse } from 'next/server';
import { 
  getCouponById, 
  saveCoupon, 
  deleteCoupon,
  claimCoupon,
  unclaimCoupon 
} from '@/lib/coupon-storage';

// GET /api/coupons/[id] - Get specific coupon
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coupon = await getCouponById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: coupon
    });
    
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id] - Update coupon (claim/unclaim/rate)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, claimedBy, rating, userId } = body;
    
    const coupon = await getCouponById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'claim':
        if (!claimedBy) {
          return NextResponse.json(
            { success: false, error: 'claimedBy is required' },
            { status: 400 }
          );
        }
        
        const claimSuccess = await claimCoupon(id, claimedBy);
        if (!claimSuccess) {
          return NextResponse.json(
            { success: false, error: 'Coupon cannot be claimed' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Coupon claimed successfully'
        });
      
      case 'unclaim':
        const unclaimSuccess = await unclaimCoupon(id);
        if (!unclaimSuccess) {
          return NextResponse.json(
            { success: false, error: 'Coupon cannot be unclaimed' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Coupon unclaimed successfully'
        });
      
      case 'rate':
        if (!rating || !userId || rating < 1 || rating > 5) {
          return NextResponse.json(
            { success: false, error: 'Valid rating (1-5) and userId required' },
            { status: 400 }
          );
        }
        
        // Update rating (simple average for now)
        const newRatingCount = coupon.ratingCount + 1;
        const newRating = ((coupon.rating * coupon.ratingCount) + rating) / newRatingCount;
        
        coupon.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
        coupon.ratingCount = newRatingCount;
        
        await saveCoupon(coupon);
        
        return NextResponse.json({
          success: true,
          message: 'Rating updated successfully',
          data: { rating: coupon.rating, ratingCount: coupon.ratingCount }
        });
      
      case 'update':
        // Update coupon details (only by owner)
        const updates = body.updates;
        if (!updates) {
          return NextResponse.json(
            { success: false, error: 'Updates data required' },
            { status: 400 }
          );
        }
        
        // Merge updates (keeping original timestamps and ownership)
        Object.assign(coupon, updates, {
          id: coupon.id,
          postedBy: coupon.postedBy,
          postedAt: coupon.postedAt,
          claimedBy: coupon.claimedBy,
          claimedAt: coupon.claimedAt
        });
        
        await saveCoupon(coupon);
        
        return NextResponse.json({
          success: true,
          message: 'Coupon updated successfully',
          data: coupon
        });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteCoupon(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}