// API endpoint for cleanup operations
import { NextResponse } from 'next/server';
import { cleanupExpiredCoupons } from '@/lib/coupon-storage';

// POST /api/cleanup - Manual cleanup trigger
export async function POST() {
  try {
    const cleanedCount = await cleanupExpiredCoupons();
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${cleanedCount} expired coupons`,
      cleanedCount
    });
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup operation failed' },
      { status: 500 }
    );
  }
}

// GET /api/cleanup - Get cleanup status/info
export async function GET() {
  try {
    // This could return info about last cleanup, scheduled cleanups, etc.
    return NextResponse.json({
      success: true,
      data: {
        lastCleanup: null, // Could be stored in a separate config file
        autoCleanupEnabled: true,
        cleanupInterval: '1 hour'
      }
    });
    
  } catch (error) {
    console.error('Error getting cleanup status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cleanup status' },
      { status: 500 }
    );
  }
}