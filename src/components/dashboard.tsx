'use client';

import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ParkingGrid from './parking-grid';
import DailyLog from './daily-log';

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
