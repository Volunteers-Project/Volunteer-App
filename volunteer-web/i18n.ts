// volunteer-web/i18n.ts
/** @type {import('next-intl/plugin').I18nConfig} */
const i18nConfig = {
  locales: ['en', 'id', 'zh'],
  defaultLocale: 'en',
};

// 👇 default export (required by next-intl/plugin)
export default i18nConfig;

// 👇 named exports (for middleware or anywhere else)
export const locales = i18nConfig.locales;
export const defaultLocale = i18nConfig.defaultLocale;
