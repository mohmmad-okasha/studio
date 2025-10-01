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
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="status">Parking Status</TabsTrigger>
            <TabsTrigger value="log">Daily Log</TabsTrigger>
          </TabsList>
          <TabsContent value="status" className="mt-6">
            <ParkingGrid />
          </TabsContent>
          <TabsContent value="log" className="mt-6">
            <DailyLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
