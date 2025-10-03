import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  totalSlots: number;
  pricePerHour: number;
  pricePerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
      unique: true, // إعداد واحد فقط لكل مستخدم
    },
    totalSlots: {
      type: Number,
      required: [true, 'عدد المواقف مطلوب'],
      min: [1, 'يجب أن يكون عدد المواقف أكبر من 0'],
      default: 30,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'سعر الساعة مطلوب'],
      min: [0, 'يجب أن يكون السعر أكبر من أو يساوي 0'],
      default: 5,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'سعر اليوم مطلوب'],
      min: [0, 'يجب أن يكون السعر أكبر من أو يساوي 0'],
      default: 25,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
