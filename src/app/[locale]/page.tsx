import Dashboard from '@/components/dashboard';
import { ParkingProvider } from '@/components/parking-provider';

export default function Home() {
  return (
    <main className="min-h-screen">
      <ParkingProvider>
        <Dashboard />
      </ParkingProvider>
    </main>
  );
}
