'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParkingSlot } from '@/lib/types';
import { useParking } from '@/hooks/use-parking';
import { useToast } from '@/hooks/use-toast';
import { Camera, Car, Loader2, Search, X } from 'lucide-react';
import { recognizeLicensePlate } from '@/ai/flows/license-plate-recognition';
import CheckOutDialog from './check-out-dialog';

export default function FindCarDialog() {
  const [isFindOpen, setFindOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const { slots } = useParking();
  const { toast } = useToast();
  
  const [isOcrLoading, setOcrLoading] = useState(false);
  const [isCameraViewOpen, setCameraViewOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [foundSlot, setFoundSlot] = useState<ParkingSlot | null>(null);
  const [isCheckOutOpen, setCheckOutOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isFindOpen && !isCheckOutOpen) {
      setLicensePlate('');
      setCameraViewOpen(false);
      setFoundSlot(null);
    }
  }, [isFindOpen, isCheckOutOpen]);

  useEffect(() => {
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
    setCameraViewOpen(false); 
    try {
      const result = await recognizeLicensePlate({ photoDataUri: dataUri });
      if (result.licensePlate) {
        const plate = result.licensePlate.toUpperCase();
        setLicensePlate(plate);
        toast({
          title: 'نجاح التعرف الضوئي',
          description: `تم التعرف على لوحة الترخيص: ${plate}`,
        });
        // Automatically search after OCR
        handleSearch(plate);
      } else {
        throw new Error('لم يتم العثور على لوحة ترخيص.');
      }
    } catch (aiError) {
      console.error("AI Error:", aiError);
      toast({
        title: 'فشل التعرف الضوئي',
        description: 'لم يتم التعرف على لوحة الترخيص. يرجى إدخالها يدويًا.',
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
  
  const handleSearch = (plateToSearch: string) => {
    const plate = plateToSearch.trim().toUpperCase();
    if (!plate) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال رقم لوحة الترخيص للبحث.',
        variant: 'destructive',
      });
      return;
    }
    
    const found = slots.find(
      (slot) => slot.isOccupied && slot.licensePlate?.toUpperCase() === plate
    );

    if (found) {
      setFoundSlot(found);
      setCheckOutOpen(true); // Open the checkout dialog
      setFindOpen(false);    // Close the find dialog
    } else {
      toast({
        title: 'لم يتم العثور على السيارة',
        description: `لا توجد سيارة متوقفة حاليًا تحمل لوحة الترخيص '${plate}'.`,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(licensePlate);
  };

  if (isCameraViewOpen) {
    return (
      <Dialog open={isCameraViewOpen} onOpenChange={setCameraViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>التقاط لوحة الترخيص</DialogTitle>
             <button className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setCameraViewOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">إغلاق</span>
            </button>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                 <div className="text-center text-white p-4 bg-black/70 rounded-md">
                  <p className="font-bold">تم رفض الوصول إلى الكاميرا</p>
                  <p className="text-sm">يرجى تمكين أذونات الكاميرا في إعدادات المتصفح.</p>
                </div>
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
              التقاط
            </Button>
          </DialogFooter>
           <canvas ref={canvasRef} className="hidden"></canvas>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <>
      <Dialog open={isFindOpen} onOpenChange={setFindOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Car className="ml-2 h-4 w-4" />
            تسجيل خروج
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>البحث عن سيارة لتسجيل الخروج</DialogTitle>
              <DialogDescription>أدخل لوحة الترخيص للعثور على السيارة ومعالجة عملية تسجيل الخروج.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="license-plate-search" className="sr-only">
                  لوحة الترخيص
                </Label>
                <div className="relative">
                   <Input
                    id="license-plate-search"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="أدخل لوحة الترخيص"
                    className="pl-24 text-lg h-12 text-right"
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
                        aria-label="التعرف على لوحة الترخيص بالكاميرا"
                      >
                        {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      </Button>
                      <Label htmlFor="plate-upload-search" className="flex items-center justify-center h-9 w-10 cursor-pointer text-muted-foreground hover:text-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          <span className="sr-only">تحميل صورة</span>
                      </Label>
                      <Input id="plate-upload-search" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-accent hover:bg-accent/90">
                <Search className="ml-2 h-4 w-4" />
                بحث
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {foundSlot && (
        <CheckOutDialog
          isOpen={isCheckOutOpen}
          setIsOpen={setCheckOutOpen}
          slot={foundSlot}
        />
      )}
    </>
  );
}
