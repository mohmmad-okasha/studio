'use client';

import { useState } from 'react';
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
import { ParkingSlot } from '@/lib/types';
import { useParking } from '@/hooks/use-parking';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import { recognizeLicensePlate } from '@/ai/flows/license-plate-recognition';
import { useTranslations } from 'next-intl';

interface CheckInDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  slot: ParkingSlot;
}

export default function CheckInDialog({ isOpen, setIsOpen, slot }: CheckInDialogProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const { checkInCar } = useParking();
  const { toast } = useToast();
  const [isOcrLoading, setOcrLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const t = useTranslations('CheckInDialog');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      toast({
        title: t('errorTitle'),
        description: t('emptyLicensePlateError'),
        variant: 'destructive',
      });
      return;
    }
    checkInCar(slot.id, licensePlate.toUpperCase());
    toast({
      title: t('successTitle'),
      description: t('checkInSuccess', { licensePlate: licensePlate.toUpperCase(), slotId: slot.id }),
      variant: 'default',
      className: 'bg-accent text-accent-foreground',
    });
    setLicensePlate('');
    setIsOpen(false);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        try {
          const result = await recognizeLicensePlate({ photoDataUri: dataUri });
          if (result.licensePlate) {
            setLicensePlate(result.licensePlate.toUpperCase());
            toast({
              title: t('ocrSuccessTitle'),
              description: t('ocrSuccessDescription', { licensePlate: result.licensePlate }),
            });
          } else {
            throw new Error('No license plate found.');
          }
        } catch (aiError) {
          console.error("AI Error:", aiError);
          toast({
            title: t('ocrFailedTitle'),
            description: t('ocrFailedDescription'),
            variant: 'destructive',
          });
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
       console.error("File Read Error:", error);
       toast({
          title: t('errorTitle'),
          description: t('fileReadError'),
          variant: 'destructive',
       });
       setOcrLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('dialogTitle', { slotId: slot.id })}</DialogTitle>
            <DialogDescription>
              {t('dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="license-plate" className="sr-only">
                {t('licensePlateLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="license-plate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder={t('licensePlatePlaceholder')}
                  className="pr-12 text-lg h-12"
                  required
                />
                 <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOcrLoading}
                    aria-label={t('uploadAriaLabel')}
                  >
                    {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {t('confirmButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
