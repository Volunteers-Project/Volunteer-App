'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1] || 'en';

  return (
    <nav className="w-full flex items-center justify-between px-8 py-3 bg-black text-white shadow-md">
      {/* Left side: logo + nav links */}
      <div className="flex items-center gap-8">
        <Link href={`/${currentLocale}`} className="font-bold text-lg hover:text-gray-300 transition-colors">
          {t('appName')}
        </Link>

        <Link href={`/${currentLocale}/events`} className="hover:text-gray-300 transition-colors">
          {t('events')}
        </Link>

        <Link href={`/${currentLocale}/about`} className="hover:text-gray-300 transition-colors">
          {t('about')}
        </Link>
      </div>

      {/* Right side: language + profile */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ProfileMenu />
      </div>
    </nav>
  );
}
