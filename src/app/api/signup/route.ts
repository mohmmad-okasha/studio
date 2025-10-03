import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/connect';
import User from '@/lib/database/models/User';

export async function POST(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await dbConnect();

    // قراءة البيانات من الطلب
    const { name, phone, password } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

 

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { error: 'رقم الهاتف مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // إنشاء المستخدم الجديد
    const newUser = new User({
      name: name.trim(),
      phone: phone.replace(/\s/g, ''), // إزالة المسافات
      password,
    });

    await newUser.save();

    // إرجاع استجابة نجاح بدون كلمة المرور
    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح',
        user: {
          id: newUser._id,
          name: newUser.name,
          phone: newUser.phone,
          createdAt: newUser.createdAt,
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('خطأ في إنشاء الحساب:', error);

    // التعامل مع أخطاء قاعدة البيانات
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'رقم الهاتف مستخدم بالفعل' },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
