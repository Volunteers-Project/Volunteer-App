// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🔹 Middleware triggered for:', pathname);

  if (pathname.startsWith('/api') || pathname.includes('.')) return;

  const hasLocale = locales.some((l) => pathname.startsWith(`/${l}`));
  console.log('🔹 Has locale?', hasLocale);

  if (!hasLocale) {
    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    console.log('🔹 Redirecting to', url.toString());
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)',
  ],
};

