import { NextRequest, NextResponse } from 'next/server';
import migratedFormIds from './lib/migrated-form-ids.json';

const ids = new Set(migratedFormIds);

export function middleware(request: NextRequest) {
  // All 1,000 mapped destinations passed live HTTPS checks on 2026-09-15.
  // Set false to temporarily disable the migration without changing mappings.
  if (process.env.MEHELP_REDIRECT_ENABLED === 'false' || request.nextUrl.hostname !== 'forms.kimnhyunlaw.com') {
    return NextResponse.next();
  }
  const path = request.nextUrl.pathname;
  const match = /^\/forms\/([a-f0-9-]{36})\/?$/.exec(path);
  let destination: string | undefined;
  if (match && ids.has(match[1])) destination = `/forms/${match[1]}/`;
  if (path === '/') destination = '/';
  if (path === '/forms' || path === '/forms/') destination = '/forms/';
  if (!destination) return NextResponse.next();
  const target = new URL(destination, 'https://mehelp.co.kr');
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

export const config = { matcher: ['/', '/forms', '/forms/:path*'] };
