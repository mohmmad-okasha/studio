import {notFound} from 'next/navigation';
import {ReactNode} from 'react';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
 
const locales = ['en', 'ar'];
 
type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default function LocaleLayout({children, params: {locale}}: Props) {
  if (!locales.includes(locale as any)) notFound();
 
  unstable_setRequestLocale(locale);
 
  // Receive messages provided in `i18n.ts`
  const messages = useMessages();
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}