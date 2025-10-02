'use client';

import { useState } from 'react';
import { useParking } from '@/hooks/use-parking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Clock, ParkingCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ParkingSlot } from '@/lib/types';
import CheckInDialog from './check-in-dialog';
import CheckOutDialog from './check-out-dialog';
import { useTranslations } from 'next-intl';

export default function ParkingGrid() {
  const t = useTranslations('ParkingGrid');
  const { slots } = useParking();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isCheckInOpen, setCheckInOpen] = useState(false);
  const [isCheckOutOpen, setCheckOutOpen] = useState(false);

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    if (slot.isOccupied) {
      setCheckOutOpen(true);
    } else {
      setCheckInOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {slots.map((slot) => (
          <Card
            key={slot.id}
            onClick={() => handleSlotClick(slot)}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
              slot.isOccupied
                ? 'bg-amber-100 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium">{t('slot', {id: slot.id})}</CardTitle>
              {slot.isOccupied ? (
                <Car className="h-5 w-5 text-amber-600" />
              ) : (
                <ParkingCircle className="h-5 w-5 text-emerald-500" />
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {slot.isOccupied && slot.licensePlate ? (
                <div className="text-sm">
                  <p className="font-bold text-lg text-amber-900">{slot.licensePlate}</p>
                  <div className="flex items-center gap-1 text-amber-700 mt-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {formatDistanceToNow(slot.checkInTime!, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-lg font-bold text-emerald-600">{t('available')}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedSlot && !selectedSlot.isOccupied && (
        <CheckInDialog
          isOpen={isCheckInOpen}
          setIsOpen={setCheckInOpen}
          slot={selectedSlot}
        />
      )}
      {selectedSlot && selectedSlot.isOccupied && (
        <CheckOutDialog
          isOpen={isCheckOutOpen}
          setIsOpen={setCheckOutOpen}
          slot={selectedSlot}
        />
      )}
    </>
  );
}
