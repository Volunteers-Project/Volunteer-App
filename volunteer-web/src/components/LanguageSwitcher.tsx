'use client';
import {usePathname} from 'next/navigation';
import {locales} from '@root/i18n';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    window.location.href = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, '')}`;
  };

  return (
    <select
      onChange={handleChange}
      defaultValue={currentLocale}
      className="border rounded px-2 py-1"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
