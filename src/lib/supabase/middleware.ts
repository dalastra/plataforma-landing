import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Public paths that do not require authentication
  const isAuthPage = path === '/login' || path === '/cadastro' || path === '/esqueci-senha' || path === '/redefinir-senha';
  const isPreview = path.startsWith('/preview');
  const isApiAuth = path.startsWith('/api/auth');
  const isStatic = path.startsWith('/_next') || path.includes('/favicon.ico') || path.startsWith('/public');

  if (isStatic || isPreview || isApiAuth) {
    return supabaseResponse;
  }

  // If user is authenticated and visits an auth page (login/cadastro), redirect to dashboard
  if (user && isAuthPage) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and tries to access private routes, redirect to login
  if (!user && !isAuthPage && !path.startsWith('/api')) {
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
