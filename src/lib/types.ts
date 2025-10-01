export interface ParkingSlot {
  id: number;
  isOccupied: boolean;
  licensePlate: string | null;
  checkInTime: Date | null;
}

export interface Transaction {
  id: string;
  licensePlate: string;
  slotId: number;
  checkInTime: Date;
  checkOutTime: Date;
  durationHours: number;
  amount: number;
  paymentMethod: 'Cash' | 'CliQ';
}
