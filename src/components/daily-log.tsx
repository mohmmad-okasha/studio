'use client';

import { useState } from 'react';
import { useParking } from '@/hooks/use-parking';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { ar } from 'date-fns/locale';

export default function DailyLog() {
  const { transactions } = useParking();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter((t) =>
    t.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>معاملات اليوم</CardTitle>
        <div className="mt-4">
          <Input
            placeholder="البحث عن طريق لوحة الترخيص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>لوحة الترخيص</TableHead>
                <TableHead className="hidden md:table-cell">الموقف</TableHead>
                <TableHead>تسجيل الدخول</TableHead>
                <TableHead>تسجيل الخروج</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="hidden sm:table-cell">الدفع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.licensePlate}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.slotId}</TableCell>
                    <TableCell>{format(t.checkInTime, 'HH:mm', { locale: ar })}</TableCell>
                    <TableCell>{format(t.checkOutTime, 'HH:mm', { locale: ar })}</TableCell>
                    <TableCell className="text-right">${t.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={t.paymentMethod === 'Cash' ? 'secondary' : 'default'} className={t.paymentMethod === 'CliQ' ? 'bg-primary' : ''}>
                        {t.paymentMethod === 'Cash' ? 'نقداً' : 'كليك'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    لا توجد معاملات لهذا اليوم بعد.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
