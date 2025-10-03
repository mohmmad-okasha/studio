'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { toast } = useToast();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone.replace(/\s/g, ''), // إزالة المسافات من رقم الهاتف
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful, received data:', data); // تسجيل للتتبع
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: `مرحباً بك، ${data.user.name}`,
        });

        // استخدام نظام المصادقة لحفظ بيانات المستخدم
        login(data.user, data.token);

        // إعادة توجيه إلى لوحة التحكم
        router.push('/admin');
      } else {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: data.error || 'بيانات الدخول غير صحيحة',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: 'حدث خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            أدخل اسمك أو رقم هاتفك وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block">
                الاسم أو رقم الهاتف
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="أدخل اسمك أو رقم هاتفك"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className={`text-right ${errors.phone ? 'border-red-500' : ''}`}
                dir="rtl"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 text-right">{errors.phone}</p>
              )}
              <p className="text-xs text-muted-foreground text-right mt-1">
                يمكنك إدخال اسمك أو رقم هاتفك
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`text-right pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 text-right">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
