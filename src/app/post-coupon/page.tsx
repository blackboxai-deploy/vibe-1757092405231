'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CouponForm } from '@/components/CouponForm';
import { CouponFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PostCouponPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser] = useState('Guest User'); // In real app, get from auth context
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: CouponFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coupon');
      }

      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your coupon has been shared with the community.',
        });
        
        // Redirect to home page after successful submission
        router.push('/');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create coupon',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <Navigation currentUser={currentUser} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Share a Coupon with the Community
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Got a coupon you won&apos;t use? Share it here to help someone else save money! 
            Make sure to include all the important details so others can make the most of it.
          </p>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for sharing great coupons:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Be clear and specific in your coupon title</li>
            <li>• Include any restrictions or minimum purchase requirements</li>
            <li>• Double-check the expiry date to avoid disappointment</li>
            <li>• Add the coupon code if there is one</li>
            <li>• Choose the right category to help others find it easily</li>
          </ul>
        </div>

        {/* Form */}
        <CouponForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          currentUser={currentUser}
        />

        {/* Community Impact */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🌟 Make a Difference
            </h3>
            <p className="text-green-800">
              Every coupon you share helps someone save money. Join our community of generous savers 
              and turn your unused deals into someone else&apos;s treasure!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}