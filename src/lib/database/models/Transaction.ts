import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  licensePlate: string;
  slotId: number;
  checkInTime: Date;
  checkOutTime?: Date;
  durationHours?: number;
  amount: number;
  paymentMethod: 'Cash' | 'CliQ';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
    },
    licensePlate: {
      type: String,
      required: [true, 'رقم اللوحة مطلوب'],
      trim: true,
    },
    slotId: {
      type: Number,
      required: [true, 'رقم الموقف مطلوب'],
      min: [1, 'رقم الموقف يجب أن يكون أكبر من 0'],
    },
    checkInTime: {
      type: Date,
      required: [true, 'وقت الدخول مطلوب'],
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    durationHours: {
      type: Number,
      min: [0, 'مدة الوقوف يجب أن تكون أكبر من أو تساوي 0'],
    },
    amount: {
      type: Number,
      required: [true, 'المبلغ مطلوب'],
      min: [0, 'المبلغ يجب أن يكون أكبر من أو يساوي 0'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'طريقة الدفع مطلوبة'],
      enum: {
        values: ['Cash', 'CliQ'],
        message: 'طريقة الدفع يجب أن تكون Cash أو CliQ',
      },
    },
  },
  {
    timestamps: true,
  }
);

// مؤشر مركب للبحث السريع
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ licensePlate: 1, userId: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
