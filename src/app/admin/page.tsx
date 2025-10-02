import AdminDashboard from '@/components/admin-dashboard';
import { ParkingProvider } from '@/components/parking-provider';

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <ParkingProvider>
        <AdminDashboard />
      </ParkingProvider>
    </main>
  );
}
