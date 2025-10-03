import { NextRequest } from 'next/server';

export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    // محاولة الحصول على معرف المستخدم من header
    const userId = request.headers.get('x-user-id');
    if (userId) {
      return userId;
    }

    // يمكن إضافة استخراج من token لاحقاً
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // if (token) {
    //   // فك شفرة token والحصول على userId
    //   return decodedToken.userId;
    // }

    return null;
  } catch (error) {
    console.error('خطأ في استخراج معرف المستخدم:', error);
    return null;
  }
}
