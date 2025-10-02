import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import path from 'path';

// A list of all locales that are supported
const locales = ['en', 'ar'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(path.join(process.cwd(), `messages/${locale}.json`))).default
  };
});
