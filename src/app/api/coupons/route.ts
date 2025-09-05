// API routes for coupon CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { 
  getFilteredCoupons, 
  saveCoupon, 
  generateCouponId,
  validateCouponData,
  getCouponStats 
} from '@/lib/coupon-storage';
import { Coupon, CouponFilters } from '@/lib/types';

// GET /api/coupons - Fetch coupons with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getCouponStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
    
    // Build filters from query parameters
    const filters: CouponFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      store: searchParams.get('store') || undefined,
      status: (searchParams.get('status') as 'available' | 'claimed' | 'expired' | 'all') || 'available',
      sortBy: (searchParams.get('sortBy') as 'newest' | 'expiry' | 'discount' | 'rating') || 'newest',
      minDiscount: searchParams.get('minDiscount') ? 
        parseFloat(searchParams.get('minDiscount')!) : undefined,
      maxDiscount: searchParams.get('maxDiscount') ? 
        parseFloat(searchParams.get('maxDiscount')!) : undefined,
    };
    
    const coupons = await getFilteredCoupons(filters);
    
    return NextResponse.json({
      success: true,
      data: coupons,
      total: coupons.length
    });
    
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate coupon data
    const validationErrors = validateCouponData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Create new coupon object
    const newCoupon: Coupon = {
      id: generateCouponId(),
      title: body.title.trim(),
      store: body.store.trim(),
      category: body.category,
      discountValue: body.discountValue.trim(),
      discountType: body.discountType,
      expiryDate: body.expiryDate,
      description: body.description.trim(),
      code: body.code?.trim() || undefined,
      imageUrl: body.imageUrl || undefined,
      postedBy: body.postedBy.trim(),
      postedAt: new Date().toISOString(),
      status: 'available',
      rating: 0,
      ratingCount: 0
    };
    
    await saveCoupon(newCoupon);
    
    return NextResponse.json({
      success: true,
      data: newCoupon,
      message: 'Coupon created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PUT /api/coupons - Bulk update (for cleanup operations)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'cleanup') {
      const { cleanupExpiredCoupons } = await import('@/lib/coupon-storage');
      const cleanedCount = await cleanupExpiredCoupons();
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired coupons`,
        cleanedCount
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}