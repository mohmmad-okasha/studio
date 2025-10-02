'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { ParkingSlot, Transaction } from '@/lib/types';
import { formatDuration } from 'date-fns';

const createInitialSlots = (count: number): ParkingSlot[] => 
  Array.from({ length: count }, (_, i) => ({
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
  totalSlots: number;
  setTotalSlots: (count: number) => void;
  pricingRules: string;
  setPricingRules: (rules: string) => void;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [totalSlots, setTotalSlots] = useState(30);
  const [pricingRules, setPricingRules] = useState("First hour: $5. Each additional hour: $3. Daily maximum: $25.");
  const [slots, setSlots] = useState<ParkingSlot[]>(() => createInitialSlots(totalSlots));
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setSlots(prevSlots => {
      const newSlots = createInitialSlots(totalSlots);
      // Preserve the state of existing slots
      for (let i = 0; i < Math.min(prevSlots.length, totalSlots); i++) {
        newSlots[i] = prevSlots[i];
      }
      return newSlots;
    });
  }, [totalSlots]);

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
    <ParkingContext.Provider value={{ slots, transactions, checkInCar, checkOutCar, totalSlots, setTotalSlots, pricingRules, setPricingRules }}>
      {children}
    </ParkingContext.Provider>
  );
};
