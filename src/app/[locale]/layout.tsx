import {NextIntlClientProvider} from 'next-intl';
import {getMessages, unstable_setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';

const locales = ['en', 'ar'];
 
type Props = {
  children: ReactNode;
  params: {locale: string};
};
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
     // In a real app, you'd want to show a 404 page here.
    // For now, we'll just throw an error.
    throw new Error(`Invalid locale: ${locale}`);
  }
 
  unstable_setRequestLocale(locale);
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
