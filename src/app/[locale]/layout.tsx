import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

const locales = ['en', 'ar'];

export default function LocaleLayout({children, params: {locale}}: Props) {
  if (!locales.includes(locale)) {
    notFound();
  }

  return children;
}
