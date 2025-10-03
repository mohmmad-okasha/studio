import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/connect';
import User from '@/lib/database/models/User';

export async function POST(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await dbConnect();

    // قراءة البيانات من الطلب
    const { phone, password } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم برقم الهاتف أو الاسم
    let user = await User.findOne({
      $or: [
        { phone: phone.replace(/\s/g, '') },
        { name: phone.trim() } // البحث بالاسم أيضاً
      ]
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'الاسم أو رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'الاسم أو رقم الهاتف أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء token بسيط (يمكن استخدام JWT لاحقاً)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    // إرجاع معلومات المستخدم بدون كلمة المرور
    const userObject = user.toJSON();

    // التأكد من أن البيانات بالتنسيق الصحيح
    const formattedUser = {
      id: userObject._id.toString(),
      name: userObject.name,
      phone: userObject.phone,
      createdAt: userObject.createdAt,
    };

    console.log('Sending user data:', formattedUser); // تسجيل للتتبع

    return NextResponse.json(
      {
        message: 'تم تسجيل الدخول بنجاح',
        user: formattedUser,
        token: token
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('خطأ في تسجيل الدخول:', error);

    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
