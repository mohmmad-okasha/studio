'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ParkingSlot } from '@/lib/types';
import { useParking } from '@/hooks/use-parking';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { formatDistanceStrict, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Separator } from './ui/separator';

interface CheckOutDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  slot: ParkingSlot;
}

export default function CheckOutDialog({ isOpen, setIsOpen, slot }: CheckOutDialogProps) {
  const { checkOutCar, pricePerHour, pricePerDay } = useParking();
  const { toast } = useToast();

  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState<number | null>(null);
  const [feeExplanation, setFeeExplanation] = useState('');
  const [manualAdjustment, setManualAdjustment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'CliQ'>('Cash');
  const [currentTime, setCurrentTime] = useState(new Date());

  const durationHours = useMemo(() => {
    if (!slot.checkInTime) return 0;
    return (currentTime.getTime() - slot.checkInTime.getTime()) / (1000 * 60 * 60);
  }, [slot.checkInTime, currentTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen && slot.checkInTime) {
      setIsLoadingFee(true);
      const hours = durationHours;
      const fullDays = Math.floor(hours / 24);
      const remainingHours = Math.ceil(hours % 24);

      let fee = 0;
      let explanation = '';
      
      if (fullDays > 0) {
        fee += fullDays * pricePerDay;
        explanation += `${fullDays} يوم بسعر ${pricePerDay}$/يوم. `;
      }
      
      const hourlyCost = remainingHours * pricePerHour;

      if (pricePerDay > 0 && hourlyCost > pricePerDay) {
        fee += pricePerDay;
        explanation += `الوقت المتبقي مقيد بالسعر اليومي ${pricePerDay}$.`;
      } else {
        fee += hourlyCost;
        if(remainingHours > 0) {
          explanation += `${remainingHours} ساعة بسعر ${pricePerHour}$/ساعة.`;
        }
      }

      setCalculatedFee(fee);
      setFeeExplanation(explanation);
      setIsLoadingFee(false);
    }
  }, [isOpen, slot.checkInTime, durationHours, pricePerHour, pricePerDay]);
  
  const finalAmount = useMemo(() => {
    const baseFee = calculatedFee ?? 0;
    const adjustment = parseFloat(manualAdjustment) || 0;
    return Math.max(0, baseFee + adjustment);
  }, [calculatedFee, manualAdjustment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkOutCar(slot.id, finalAmount, paymentMethod);
    toast({
      title: 'نجاح',
      description: `تم تسجيل خروج السيارة بلوحة ${slot.licensePlate} من الموقف ${slot.id}.`,
      className: 'bg-accent text-accent-foreground',
    });
    setIsOpen(false);
    setManualAdjustment('');
  };
  
  if (!slot.checkInTime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تسجيل الخروج من الموقف {slot.id}</DialogTitle>
            <DialogDescription>
              تأكيد التفاصيل ومعالجة الدفع للوحة الترخيص <span className="font-bold text-primary">{slot.licensePlate}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-sm space-y-1 rounded-md border bg-muted/50 p-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">تسجيل الدخول:</span>
                <span className="font-medium">{format(slot.checkInTime, 'Pp', { locale: ar })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المدة:</span>
                <span className="font-medium">{formatDistanceStrict(currentTime, slot.checkInTime, { locale: ar, addSuffix: false })}</span>
              </div>
            </div>
            
            <div className="p-3 bg-secondary/50 rounded-lg">
              <h4 className="font-semibold mb-2">حساب الرسوم</h4>
              {isLoadingFee ? (
                 <div className="flex items-center justify-center h-24">
                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{feeExplanation}</p>
                  <div className="flex items-center justify-between">
                    <Label>الرسوم المحسوبة</Label>
                    <p className="font-semibold">${calculatedFee?.toFixed(2) ?? '0.00'}</p>
                  </div>
                   <div className="flex items-center justify-between">
                    <Label htmlFor="adjustment">تعديل يدوي</Label>
                    <Input id="adjustment" type="number" step="0.01" value={manualAdjustment} onChange={e => setManualAdjustment(e.target.value)} className="w-28 h-8" placeholder="$0.00"/>
                  </div>
                  <Separator />
                   <div className="flex items-baseline justify-between pt-1">
                    <Label className="text-base">المبلغ الإجمالي</Label>
                    <p className="text-2xl font-bold text-accent">${finalAmount.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block font-semibold">طريقة الدفع</Label>
              <RadioGroup defaultValue="Cash" value={paymentMethod} onValueChange={(val: 'Cash' | 'CliQ') => setPaymentMethod(val)} className="flex items-center gap-4" dir="rtl">
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer rounded-md border p-3 flex-1 data-[state=checked]:border-primary">
                  <RadioGroupItem value="Cash" id="cash" />
                  نقداً
                </Label>
                <Label htmlFor="cliq" className="flex items-center gap-2 cursor-pointer rounded-md border p-3 flex-1 data-[state=checked]:border-primary">
                  <RadioGroupItem value="CliQ" id="cliq" />
                  كليك
                </Label>
              </RadioGroup>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90" disabled={isLoadingFee}>
              تأكيد وتسجيل الخروج
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
