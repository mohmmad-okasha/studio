import { useContext } from 'react';
import { ParkingContext, ParkingContextType } from '@/components/parking-provider';

export const useParking = (): ParkingContextType => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
