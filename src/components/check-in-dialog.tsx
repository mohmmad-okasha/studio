'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ParkingSlot } from '@/lib/types';
import { useParking } from '@/hooks/use-parking';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, X } from 'lucide-react';
import { recognizeLicensePlate } from '@/ai/flows/license-plate-recognition';
import { useTranslations } from 'next-intl';

interface CheckInDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  slot: ParkingSlot;
}

export default function CheckInDialog({ isOpen, setIsOpen, slot }: CheckInDialogProps) {
  const t = useTranslations('CheckInDialog');
  const [licensePlate, setLicensePlate] = useState('');
  const { checkInCar } = useParking();
  const { toast } = useToast();
  const [isOcrLoading, setOcrLoading] = useState(false);
  const [isCameraViewOpen, setCameraViewOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when main dialog is closed
      setLicensePlate('');
      setCameraViewOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Stop camera stream when either dialog closes
    if (!isCameraViewOpen) {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    }
  }, [isCameraViewOpen]);
  
  const processImage = async (dataUri: string) => {
    setOcrLoading(true);
    setCameraViewOpen(false); // Close camera view after capture
    try {
      const result = await recognizeLicensePlate({ photoDataUri: dataUri });
      if (result.licensePlate) {
        setLicensePlate(result.licensePlate.toUpperCase());
        toast({
          title: t('toast.ocrSuccessTitle'),
          description: t('toast.ocrSuccessDescription', { licensePlate: result.licensePlate }),
        });
      } else {
        throw new Error(t('errors.noPlateFound'));
      }
    } catch (aiError) {
      console.error("AI Error:", aiError);
      toast({
        title: t('toast.ocrFailedTitle'),
        description: t('toast.ocrFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setOcrLoading(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      processImage(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    setCameraViewOpen(true);
    setHasCameraPermission(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        processImage(dataUri);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      toast({
        title: t('errors.title'),
        description: t('errors.plateEmpty'),
        variant: 'destructive',
      });
      return;
    }
    checkInCar(slot.id, licensePlate.toUpperCase());
    toast({
      title: t('toast.checkInSuccessTitle'),
      description: t('toast.checkInSuccessDescription', { licensePlate: licensePlate.toUpperCase(), slotId: slot.id }),
      variant: 'default',
      className: 'bg-accent text-accent-foreground',
    });
    setIsOpen(false);
  };
  
  if (isCameraViewOpen) {
    return (
      <Dialog open={isCameraViewOpen} onOpenChange={setCameraViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('camera.title')}</DialogTitle>
             <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setCameraViewOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">{t('camera.close')}</span>
            </button>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                 <Alert variant="destructive" className="w-auto">
                    <AlertTitle>{t('camera.permissionDeniedTitle')}</AlertTitle>
                    <AlertDescription>{t('camera.permissionDeniedDescription')}</AlertDescription>
                </Alert>
              </div>
            )}
             {hasCameraPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full bg-accent hover:bg-accent/90">
              <Camera className="mr-2 h-4 w-4" />
              {t('camera.captureButton')}
            </Button>
          </DialogFooter>
           <canvas ref={canvasRef} className="hidden"></canvas>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('title', {slotId: slot.id})}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="license-plate" className="sr-only">
                {t('plateInputLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="license-plate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder={t('plateInputPlaceholder')}
                  className="pr-24 text-lg h-12"
                  required
                />
                 <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-9 w-10"
                      onClick={openCamera}
                      disabled={isOcrLoading}
                      aria-label={t('cameraAriaLabel')}
                    >
                      {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                    </Button>
                    <Label htmlFor="plate-upload" className="flex items-center justify-center h-9 w-10 cursor-pointer text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <span className="sr-only">{t('uploadAriaLabel')}</span>
                    </Label>
                    <Input id="plate-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                 </div>
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
