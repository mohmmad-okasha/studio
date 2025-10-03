'use client';

import Header from '@/components/header';
import ParkingGrid from './parking-grid';
import { useParking } from '@/hooks/use-parking';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { slots } = useParking();

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.isOccupied).length;
  const availableSlots = totalSlots - occupiedSlots;
  const availablePercentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6 p-4 bg-card border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-medium">المواقف المتاحة</h3>
            <span className="text-sm font-bold text-primary">
              {availableSlots} من {totalSlots}
            </span>
          </div>
          <Progress value={availablePercentage} className="h-2" />
        </div>
        <ParkingGrid />
      </div>
    </div>
  );
}
