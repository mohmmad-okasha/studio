import Dashboard from '@/components/dashboard';
import { ParkingProvider } from '@/components/parking-provider';

export default function Home() {
  return (
    <ParkingProvider>
      <Dashboard />
    </ParkingProvider>
  );
}
