'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AdminDashboard from '@/components/admin-dashboard';
import { ParkingProvider } from '@/components/parking-provider';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // سيتم التوجيه بواسطة useEffect
  }

  return (
    <main className="min-h-screen">
      <ParkingProvider>
        <AdminDashboard />
      </ParkingProvider>
    </main>
  );
}
