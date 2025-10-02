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
import { useTranslations } from 'next-intl';

export default function DailyLog() {
  const t = useTranslations('DailyLog');
  const { transactions } = useParking();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter((t) =>
    t.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <div className="mt-4">
          <Input
            placeholder={t('searchPlaceholder')}
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
                <TableHead>{t('columns.licensePlate')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('columns.slot')}</TableHead>
                <TableHead>{t('columns.checkIn')}</TableHead>
                <TableHead>{t('columns.checkOut')}</TableHead>
                <TableHead className="text-right">{t('columns.amount')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('columns.payment')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.licensePlate}</TableCell>
                    <TableCell className="hidden md:table-cell">{t.slotId}</TableCell>
                    <TableCell>{format(t.checkInTime, 'HH:mm')}</TableCell>
                    <TableCell>{format(t.checkOutTime, 'HH:mm')}</TableCell>
                    <TableCell className="text-right">${t.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={t.paymentMethod === 'Cash' ? 'secondary' : 'default'} className={t.paymentMethod === 'CliQ' ? 'bg-primary' : ''}>{t.paymentMethod}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {t('noTransactions')}
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
