'use client';

import Header from '@/components/header';
import ParkingGrid from './parking-grid';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <ParkingGrid />
      </div>
    </div>
  );
}
