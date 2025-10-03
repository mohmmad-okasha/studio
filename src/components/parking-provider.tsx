'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { ParkingSlot, Transaction } from '@/lib/types';
import { formatDuration } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
  pricePerHour: number;
  setPricePerHour: (price: number) => void;
  pricePerDay: number;
  setPricePerDay: (price: number) => void;
  saveSettings: (settings: { newTotalSlots: number; newPricePerHour: number; newPricePerDay: number }) => void;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [totalSlots, setTotalSlots] = useState(30);
  const [pricePerHour, setPricePerHour] = useState(5);
  const [pricePerDay, setPricePerDay] = useState(25);
  const [slots, setSlots] = useState<ParkingSlot[]>(() => createInitialSlots(totalSlots));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحقق من وجود جلسة مستخدم صالحة وتوجيه إلى تسجيل الدخول إذا لم تكن موجودة أو صالحة
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم يكن هناك مستخدم مسجل دخول
        router.push('/login');
      }
      // إذا كان هناك مستخدم، نثق في نظام المصادقة ولا نحتاج للتحقق الإضافي من localStorage
    }
  }, [user, isLoading, router]);

  // تحميل البيانات من قاعدة البيانات عند تسجيل الدخول
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // تحميل الإعدادات
        const settingsResponse = await fetch('/api/settings', {
          headers: {
            'x-user-id': user.id,
          },
        });
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setTotalSlots(settings.totalSlots || 30);
          setPricePerHour(settings.pricePerHour || 5);
          setPricePerDay(settings.pricePerDay || 25);
        }

        // تحميل المعاملات
        const transactionsResponse = await fetch('/api/transactions', {
          headers: {
            'x-user-id': user.id,
          },
        });
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const checkInCar = (slotId: number, licensePlate: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, isOccupied: true, licensePlate, checkInTime: new Date() }
          : slot
      )
    );
  };

  const checkOutCar = async (slotId: number, amount: number, paymentMethod: 'Cash' | 'CliQ') => {
    setSlots((currentSlots) => {
      const slotToCheckOut = currentSlots.find((slot) => slot.id === slotId);
      if (!slotToCheckOut || !slotToCheckOut.checkInTime) return currentSlots;

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

      // حفظ المعاملة في قاعدة البيانات
      fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          licensePlate: newTransaction.licensePlate,
          slotId: newTransaction.slotId,
          checkInTime: newTransaction.checkInTime,
          checkOutTime: newTransaction.checkOutTime,
          durationHours: newTransaction.durationHours,
          amount: newTransaction.amount,
          paymentMethod: newTransaction.paymentMethod,
        }),
      }).then(response => {
        if (response.ok) {
          // إضافة المعاملة إلى القائمة المحلية
          setTransactions((prev) => [newTransaction, ...prev]);
        }
      }).catch(error => {
        console.error('خطأ في حفظ المعاملة:', error);
      });

      // تحديث حالة الموقف محلياً بغض النظر عن نجاح حفظ قاعدة البيانات
      return currentSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, isOccupied: false, licensePlate: null, checkInTime: null }
          : slot
      );
    });
  };

  const saveSettings = async ({ newTotalSlots, newPricePerHour, newPricePerDay }: { newTotalSlots: number; newPricePerHour: number; newPricePerDay: number }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          totalSlots: newTotalSlots,
          pricePerHour: newPricePerHour,
          pricePerDay: newPricePerDay,
        }),
      });

      if (response.ok) {
        // تحديث الحالة المحلية فقط بعد نجاح حفظ قاعدة البيانات
        setTotalSlots(newTotalSlots);
        setPricePerHour(newPricePerHour);
        setPricePerDay(newPricePerDay);
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
    }
  };

  return (
    <ParkingContext.Provider value={{
        slots,
        transactions,
        checkInCar,
        checkOutCar,
        totalSlots,
        setTotalSlots,
        pricePerHour,
        setPricePerHour,
        pricePerDay,
        setPricePerDay,
        saveSettings
    }}>
      {!isLoading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      )}
    </ParkingContext.Provider>
  );
};
