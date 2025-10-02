import Dashboard from '@/components/dashboard';
import { ParkingProvider } from '@/components/parking-provider';
import {unstable_setRequestLocale} from 'next-intl/server';

type Props = {
  params: {locale: string};
};

export default function Home({params: {locale}}: Props) {
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  return (
    <main className="min-h-screen">
      <ParkingProvider>
        <Dashboard />
      </ParkingProvider>
    </main>
  );
}
