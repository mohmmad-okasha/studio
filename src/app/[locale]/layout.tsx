import {notFound} from 'next/navigation';
import {ReactNode} from 'react';
import {NextIntlClientProvider, useMessages} from 'next-intl';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

const locales = ['en', 'ar'];

export default function LocaleLayout({children, params: {locale}}: Props) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
