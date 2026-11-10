import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { saveUserSettings } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const cleanToken = token?.trim();

    if (!cleanToken) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso Vercel é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Verify token with Vercel API
    const vercelRes = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!vercelRes.ok) {
      const err = await vercelRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            err.error?.message ||
            'Token da Vercel inválido ou expirado. Gere um novo token em vercel.com/account/tokens.',
        },
        { status: 401 }
      );
    }

    const userData = await vercelRes.json();
    const vercelUser = userData.user;
    const email = vercelUser.email || `${vercelUser.username}@vercel.user`;
    const fullName = vercelUser.name || vercelUser.username;
    const avatarUrl = vercelUser.avatar ? `https://vercel.com/api/www/avatar/${vercelUser.avatar}` : null;

    // 2. Sign in or Sign up via Supabase using this Vercel identity
    const supabase = await createClient();
    
    // Deterministic internal password for Vercel OAuth linked accounts
    const internalVercelPassword = `Vercel#${vercelUser.id}#SafeAuth2026`;

    // Attempt sign in first
    let authRes = await supabase.auth.signInWithPassword({
      email,
      password: internalVercelPassword,
    });

    // If user doesn't exist, sign up
    if (authRes.error && authRes.error.message.includes('Invalid login credentials')) {
      const signUpRes = await supabase.auth.signUp({
        email,
        password: internalVercelPassword,
        options: {
          data: {
            full_name: fullName,
            avatar_url: avatarUrl,
            vercel_username: vercelUser.username,
          },
        },
      });

      if (signUpRes.error) {
        return NextResponse.json(
          { success: false, error: signUpRes.error.message },
          { status: 500 }
        );
      }

      authRes = await supabase.auth.signInWithPassword({
        email,
        password: internalVercelPassword,
      });
    }

    if (authRes.error || !authRes.data.user) {
      return NextResponse.json(
        { success: false, error: authRes.error?.message || 'Falha ao autenticar sessão.' },
        { status: 500 }
      );
    }

    const userId = authRes.data.user.id;

    // 3. Persist individual Vercel credentials to user_settings
    await saveUserSettings(userId, {
      vercelAccessToken: cleanToken,
      vercelUser: {
        id: vercelUser.id,
        username: vercelUser.username,
        email: vercelUser.email,
        name: vercelUser.name,
        avatar: avatarUrl || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        fullName,
        vercelUsername: vercelUser.username,
      },
      message: `Bem-vindo, @${vercelUser.username}! Conectado via Vercel com sucesso.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao processar login com Vercel.' },
      { status: 500 }
    );
  }
}
