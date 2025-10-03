import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/connect';
import Settings from '@/lib/database/models/Settings';
import { getUserIdFromRequest } from '@/lib/middleware/auth';

// GET /api/settings - استرجاع إعدادات المستخدم
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

    const settings = await Settings.findOne({ userId });

    if (!settings) {
      // إنشاء إعدادات افتراضية للمستخدم الجديد
      const defaultSettings = new Settings({
        userId,
        totalSlots: 30,
        pricePerHour: 5,
        pricePerDay: 25,
      });
      await defaultSettings.save();

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('خطأ في استرجاع الإعدادات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع الإعدادات' },
      { status: 500 }
    );
  }
}

// POST /api/settings - حفظ إعدادات المستخدم
export async function POST(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await dbConnect();

    const { totalSlots, pricePerHour, pricePerDay } = await request.json();

    // التحقق من البيانات المطلوبة
    if (totalSlots === undefined || pricePerHour === undefined || pricePerDay === undefined) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البيانات
    if (totalSlots < 1) {
      return NextResponse.json(
        { error: 'عدد المواقف يجب أن يكون أكبر من 0' },
        { status: 400 }
      );
    }

    if (pricePerHour < 0 || pricePerDay < 0) {
      return NextResponse.json(
        { error: 'الأسعار يجب أن تكون أكبر من أو تساوي 0' },
        { status: 400 }
      );
    }

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // البحث عن الإعدادات الموجودة أو إنشاء جديدة
    let settings = await Settings.findOne({ userId });

    if (settings) {
      // تحديث الإعدادات الموجودة
      settings.totalSlots = totalSlots;
      settings.pricePerHour = pricePerHour;
      settings.pricePerDay = pricePerDay;
      await settings.save();
    } else {
      // إنشاء إعدادات جديدة
      settings = new Settings({
        userId,
        totalSlots,
        pricePerHour,
        pricePerDay,
      });
      await settings.save();
    }

    return NextResponse.json({
      message: 'تم حفظ الإعدادات بنجاح',
      settings
    });

  } catch (error: any) {
    console.error('خطأ في حفظ الإعدادات:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}
