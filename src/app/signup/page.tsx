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

export default function SignupPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { toast } = useToast();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } /*else if (!/^(\+966|0)?[5][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صالح';
    }*/

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
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
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\s/g, ''), // إزالة المسافات من رقم الهاتف
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful, received data:', data); // تسجيل للتتبع
        toast({
          title: 'تم التسجيل بنجاح',
          description: 'مرحباً بك في نظام إدارة مواقف السيارات',
        });

        // استخدام نظام المصادقة لحفظ بيانات المستخدم
        login(data.user, data.token);

        // إعادة توجيه إلى لوحة التحكم
        router.push('/admin');
      } else {
        toast({
          title: 'خطأ في التسجيل',
          description: data.error || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      toast({
        title: 'خطأ في التسجيل',
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
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            أدخل بياناتك للتسجيل في نظام إدارة مواقف السيارات
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block">
                الاسم الكامل
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={handleInputChange('name')}
                className={`text-right ${errors.name ? 'border-red-500' : ''}`}
                dir="rtl"
              />
              {errors.name && (
                <p className="text-sm text-red-500 text-right">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block">
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="05xxxxxxxx"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className={`text-right ${errors.phone ? 'border-red-500' : ''}`}
                dir="rtl"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 text-right">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة مرور قوية"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-right block">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="أعد إدخال كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`text-right pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 text-right">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                تسجيل الدخول
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
