import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
    </div>
  );
}
