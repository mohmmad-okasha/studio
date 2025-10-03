import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/connect';
import Transaction from '@/lib/database/models/Transaction';
import { getUserIdFromRequest } from '@/lib/middleware/auth';

// GET /api/transactions - استرجاع معاملات المستخدم
export async function GET(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await dbConnect();

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }) // ترتيب تنازلي حسب تاريخ الإنشاء
      .limit(100); // قصر النتائج على آخر 100 معاملة

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('خطأ في استرجاع المعاملات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع المعاملات' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - حفظ معاملة جديدة
export async function POST(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await dbConnect();

    const {
      licensePlate,
      slotId,
      checkInTime,
      checkOutTime,
      durationHours,
      amount,
      paymentMethod
    } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!licensePlate || !slotId || !checkInTime || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البيانات
    if (slotId < 1) {
      return NextResponse.json(
        { error: 'رقم الموقف يجب أن يكون أكبر من 0' },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' },
        { status: 400 }
      );
    }

    if (!['Cash', 'CliQ'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'طريقة الدفع يجب أن تكون Cash أو CliQ' },
        { status: 400 }
      );
    }

    // الحصول على معرف المستخدم (سيتم استبداله بنظام المصادقة الحقيقي)
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // إنشاء معاملة جديدة
    const newTransaction = new Transaction({
      userId,
      licensePlate: licensePlate.trim(),
      slotId,
      checkInTime: new Date(checkInTime),
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      durationHours,
      amount,
      paymentMethod,
    });

    await newTransaction.save();

    return NextResponse.json({
      message: 'تم حفظ المعاملة بنجاح',
      transaction: newTransaction
    }, { status: 201 });

  } catch (error: any) {
    console.error('خطأ في حفظ المعاملة:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ المعاملة' },
      { status: 500 }
    );
  }
}
