'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import DailyLog from './daily-log';
import { useParking } from '@/hooks/use-parking';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import OccupancyChart from './occupancy-chart';

export default function AdminDashboard() {
    const { 
        slots, 
        transactions, 
        totalSlots, 
        pricePerHour, 
        pricePerDay,
        saveSettings
    } = useParking();
    const { toast } = useToast();

    const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots);
    const [localPricePerHour, setLocalPricePerHour] = useState(pricePerHour);
    const [localPricePerDay, setLocalPricePerDay] = useState(pricePerDay);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setLocalTotalSlots(totalSlots);
        setLocalPricePerHour(pricePerHour);
        setLocalPricePerDay(pricePerDay);
    }, [totalSlots, pricePerHour, pricePerDay]);

    useEffect(() => {
        const hasChanges = 
            localTotalSlots !== totalSlots || 
            localPricePerHour !== pricePerHour || 
            localPricePerDay !== pricePerDay;
        setHasUnsavedChanges(hasChanges);
    }, [localTotalSlots, localPricePerHour, localPricePerDay, totalSlots, pricePerHour, pricePerDay]);

    const handleSave = () => {
        saveSettings({
            newTotalSlots: localTotalSlots,
            newPricePerHour: localPricePerHour,
            newPricePerDay: localPricePerDay,
        });
        setHasUnsavedChanges(false);
        toast({
            title: "تم حفظ الإعدادات",
            description: "تم حفظ التغييرات الخاصة بك بنجاح.",
            className: 'bg-accent text-accent-foreground'
        });
    };

    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">لوحة تحكم المسؤول</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <OccupancyChart />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">من {transactions.length} معاملات اليوم</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">المواقف المشغولة</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{occupiedSlots} / {slots.length}</div>
                    <p className="text-xs text-muted-foreground">مواقف السيارات المشغولة حاليًا</p>
                </CardContent>
            </Card>
        </div>

        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>الإعدادات</CardTitle>
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>لديك تغييرات غير محفوظة.</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="total-slots">إجمالي مواقف السيارات</Label>
                        <Input 
                            id="total-slots" 
                            type="number" 
                            value={localTotalSlots}
                            onChange={(e) => setLocalTotalSlots(parseInt(e.target.value, 10) || 1)}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price-per-hour">السعر للساعة ($)</Label>
                        <Input 
                            id="price-per-hour"
                            type="number" 
                            value={localPricePerHour}
                            onChange={(e) => setLocalPricePerHour(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price-per-day">السعر لليوم ($)</Label>
                        <Input 
                            id="price-per-day"
                            type="number" 
                            value={localPricePerDay}
                            onChange={(e) => setLocalPricePerDay(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                        حفظ الإعدادات
                    </Button>
                </div>
            </CardContent>
        </Card>

        <DailyLog />
      </div>
    </div>
  );
}
