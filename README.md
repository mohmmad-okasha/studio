# ParkPilot

This is a Next.js application for public parking garage management.

## إعداد قاعدة البيانات

لتشغيل التطبيق، تحتاج إلى إعداد قاعدة بيانات MongoDB وإضافة متغير البيئة التالي إلى ملف `.env`:

```env
# رابط قاعدة البيانات MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parking-system
```

### خيارات قاعدة البيانات:

1. **MongoDB Atlas (مجاني)**:
   - سجّل في [MongoDB Atlas](https://www.mongodb.com/atlas)
   - أنشئ cluster مجاني
   - احصل على connection string من "Connect" > "Connect your application"
   - استبدل `<username>`, `<password>`, واسم قاعدة البيانات

2. **MongoDB محلي**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/parking-system
   ```

### مثال لـ MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/parking-system?retryWrites=true&w=majority
```

## تشغيل التطبيق

```bash
# تثبيت المكتبات
npm install

# تشغيل التطبيق في وضع التطوير
npm run dev
```

## الميزات

- إدارة مواقف السيارات العامة
- نظام تسجيل المستخدمين
- لوحة تحكم إدارية
- دعم اللغة العربية والوضع الليلي
