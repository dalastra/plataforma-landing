import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso Vercel é obrigatório.' },
        { status: 400 }
      );
    }

    // Call Vercel API v2/user with the provided personal token
    const vercelRes = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!vercelRes.ok) {
      const errData = await vercelRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            errData.error?.message ||
            `Token inválido ou expirado (status ${vercelRes.status}). Verifique seu token da Vercel.`,
        },
        { status: 401 }
      );
    }

    const userData = await vercelRes.json();
    const vercelUser = {
      id: userData.user.id,
      username: userData.user.username,
      email: userData.user.email,
      name: userData.user.name,
      avatar: userData.user.avatar ? `https://vercel.com/api/www/avatar/${userData.user.avatar}` : null,
    };

    return NextResponse.json({
      success: true,
      user: vercelUser,
      message: `Conectado com sucesso à conta Vercel de @${vercelUser.username} (${vercelUser.email})!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Falha ao testar conexão com Vercel.' },
      { status: 500 }
    );
  }
}
