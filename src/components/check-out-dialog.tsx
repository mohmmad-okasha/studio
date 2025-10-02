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
            <div className="text-sm">
              <p><strong>تسجيل الدخول:</strong> {format(slot.checkInTime, 'Pp', { locale: ar })}</p>
              <p><strong>المدة:</strong> {formatDistanceStrict(currentTime, slot.checkInTime, { locale: ar, addSuffix: true })}</p>
            </div>
            
            <div className="p-3 bg-secondary rounded-lg">
              <h4 className="font-semibold mb-2">حساب الرسوم</h4>
              {isLoadingFee ? (
                 <div className="flex items-center justify-center h-24">
                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{feeExplanation}</p>
                  <div className="flex items-baseline justify-between">
                    <Label>الرسوم المحسوبة</Label>
                    <p className="text-lg font-bold">${calculatedFee?.toFixed(2) ?? '0.00'}</p>
                  </div>
                   <div className="flex items-center justify-between">
                    <Label htmlFor="adjustment">تعديل</Label>
                    <Input id="adjustment" type="number" step="0.01" value={manualAdjustment} onChange={e => setManualAdjustment(e.target.value)} className="w-28 h-8" placeholder="$0.00"/>
                  </div>
                   <div className="flex items-baseline justify-between border-t pt-2 mt-2">
                    <Label className="text-base">المبلغ الإجمالي</Label>
                    <p className="text-2xl font-bold text-accent">${finalAmount.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block">طريقة الدفع</Label>
              <RadioGroup defaultValue="Cash" value={paymentMethod} onValueChange={(val: 'Cash' | 'CliQ') => setPaymentMethod(val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cash" id="cash" />
                  <Label htmlFor="cash">نقداً</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CliQ" id="cliq" />
                  <Label htmlFor="cliq">كليك</Label>
                </div>
              </RadioGroup>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isLoadingFee}>
              تأكيد وتسجيل الخروج
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
