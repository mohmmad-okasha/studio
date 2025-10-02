'use client';

import Header from '@/components/header';
import DailyLog from './daily-log';
import { useParking } from '@/hooks/use-parking';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';

export default function AdminDashboard() {
    const { slots, transactions, totalSlots, setTotalSlots, pricePerHour, setPricePerHour, pricePerDay, setPricePerDay } = useParking();

    const occupiedSlots = slots.filter(s => s.isOccupied).length;
    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">from {transactions.length} transactions today</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupied Slots</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{occupiedSlots} / {slots.length}</div>
                    <p className="text-xs text-muted-foreground">Currently occupied parking slots</p>
                </CardContent>
            </Card>
        </div>

        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="total-slots">Total Parking Slots</Label>
                    <Input 
                        id="total-slots" 
                        type="number" 
                        value={totalSlots}
                        onChange={(e) => setTotalSlots(parseInt(e.target.value, 10) || 1)}
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price-per-hour">Price Per Hour ($)</Label>
                    <Input 
                        id="price-per-hour"
                        type="number" 
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(parseFloat(e.target.value) || 0)}
                        min="0"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="price-per-day">Price Per Day ($)</Label>
                    <Input 
                        id="price-per-day"
                        type="number" 
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(parseFloat(e.target.value) || 0)}
                        min="0"
                    />
                </div>
            </CardContent>
        </Card>

        <DailyLog />
      </div>
    </div>
  );
}
