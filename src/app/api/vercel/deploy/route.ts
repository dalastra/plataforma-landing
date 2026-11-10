import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProject } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { projectId, htmlContent, customSlug } = body;

    if (!projectId && !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Identificador do projeto ou HTML é obrigatório.' },
        { status: 400 }
      );
    }

    // Retrieve user settings to get their personal Vercel Token
    let token = body.token?.trim();
    let teamId = body.teamId?.trim();

    if (!token && user) {
      const { data: dbSettings } = await supabase
        .from('user_settings')
        .select('platform_settings')
        .eq('user_id', user.id)
        .single();

      if (dbSettings?.platform_settings?.vercelAccessToken) {
        token = dbSettings.platform_settings.vercelAccessToken;
        teamId = dbSettings.platform_settings.vercelTeamId;
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Nenhuma conta Vercel conectada. Acesse Configurações para conectar seu token pessoal da Vercel.',
        },
        { status: 400 }
      );
    }

    // Determine clean project slug
    let project = null;
    let businessName = 'landing-page';
    let finalHtml = htmlContent;

    if (projectId) {
      project = await getProjectById(projectId);
      if (project) {
        businessName = project.businessName;
        if (!finalHtml) {
          finalHtml = project.htmlContent;
        }
      }
    }

    if (!finalHtml) {
      return NextResponse.json(
        { success: false, error: 'Nenhum conteúdo HTML disponível para deploy.' },
        { status: 400 }
      );
    }

    const safeSlug =
      customSlug ||
      `lp-${businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30)}-${Date.now().toString(36)}`;

    // Build deployment payload for Vercel REST API v13
    const url = new URL('https://api.vercel.com/v13/deployments');
    if (teamId) {
      url.searchParams.set('teamId', teamId);
    }

    const vercelRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: safeSlug,
        target: 'production',
        files: [
          {
            file: 'index.html',
            data: Buffer.from(finalHtml, 'utf-8').toString('base64'),
            encoding: 'base64',
          },
        ],
        projectSettings: {
          framework: null,
        },
      }),
    });

    const resData = await vercelRes.json();

    if (!vercelRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            resData.error?.message ||
            `Erro na Vercel (${vercelRes.status}): Não foi possível publicar.`,
        },
        { status: vercelRes.status }
      );
    }

    const liveUrl = `https://${resData.url}`;

    // Update project with live Vercel URL
    if (projectId && project) {
      await updateProject(projectId, {
        vercelUrl: liveUrl,
        status: 'ready',
      });
    }

    return NextResponse.json({
      success: true,
      url: liveUrl,
      deploymentId: resData.id,
      readyState: resData.readyState,
      message: 'Landing page publicada com sucesso na sua conta Vercel!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Falha ao publicar na Vercel.' },
      { status: 500 }
    );
  }
}
