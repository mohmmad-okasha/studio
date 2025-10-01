'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { ParkingSlot, Transaction } from '@/lib/types';
import { formatDuration } from 'date-fns';

const TOTAL_SLOTS = 30;

const initialSlots: ParkingSlot[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
  id: i + 1,
  isOccupied: false,
  licensePlate: null,
  checkInTime: null,
}));

export interface ParkingContextType {
  slots: ParkingSlot[];
  transactions: Transaction[];
  checkInCar: (slotId: number, licensePlate: string) => void;
  checkOutCar: (slotId: number, amount: number, paymentMethod: 'Cash' | 'CliQ') => void;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>(initialSlots);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const checkInCar = (slotId: number, licensePlate: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, isOccupied: true, licensePlate, checkInTime: new Date() }
          : slot
      )
    );
  };

  const checkOutCar = (slotId: number, amount: number, paymentMethod: 'Cash' | 'CliQ') => {
    const slotToCheckOut = slots.find((slot) => slot.id === slotId);
    if (!slotToCheckOut || !slotToCheckOut.checkInTime) return;

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - slotToCheckOut.checkInTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      licensePlate: slotToCheckOut.licensePlate!,
      slotId: slotToCheckOut.id,
      checkInTime: slotToCheckOut.checkInTime,
      checkOutTime,
      durationHours,
      amount,
      paymentMethod,
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, isOccupied: false, licensePlate: null, checkInTime: null }
          : slot
      )
    );
  };
  
  return (
    <ParkingContext.Provider value={{ slots, transactions, checkInCar, checkOutCar }}>
      {children}
    </ParkingContext.Provider>
  );
};
