import Dashboard from '@/components/dashboard';
import { ParkingProvider } from '@/components/parking-provider';
import {unstable_setRequestLocale} from 'next-intl/server';

export default function Home({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  
  return (
    <main className="min-h-screen">
      <ParkingProvider>
        <Dashboard />
      </ParkingProvider>
    </main>
  );
}
