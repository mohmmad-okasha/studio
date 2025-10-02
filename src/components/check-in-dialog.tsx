'use client';

import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      toast({
        title: 'Error',
        description: 'License plate cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    checkInCar(slot.id, licensePlate.toUpperCase());
    toast({
      title: 'Success',
      description: `Car with plate ${licensePlate.toUpperCase()} checked into slot ${slot.id}.`,
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
              title: 'OCR Success',
              description: `License plate recognized: ${result.licensePlate}`,
            });
          } else {
            throw new Error('No license plate found.');
          }
        } catch (aiError) {
          console.error("AI Error:", aiError);
          toast({
            title: 'OCR Failed',
            description: 'Could not recognize the license plate. Please enter it manually.',
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
          title: 'Error',
          description: 'Failed to read the image file.',
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
            <DialogTitle>Check-in to Slot {slot.id}</DialogTitle>
            <DialogDescription>
              Enter the vehicle's license plate to check it in.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="license-plate" className="sr-only">
                License Plate
              </Label>
              <div className="relative">
                <Input
                  id="license-plate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="Enter license plate"
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
                    aria-label="Upload license plate image"
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
              Confirm Check-in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
