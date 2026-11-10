import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, updateProject } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { projectId, domainName } = await req.json();

    if (!projectId || !domainName) {
      return NextResponse.json(
        { success: false, error: 'ID do projeto e nome de domínio são obrigatórios.' },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId, user.id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado.' }, { status: 404 });
    }

    // Get user's Vercel token
    const { data: dbSettings } = await supabase
      .from('user_settings')
      .select('vercel_access_token, vercel_team_id')
      .eq('user_id', user.id)
      .single();

    const token = dbSettings?.vercel_access_token;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Conecte sua conta Vercel em Configurações para vincular domínios.' },
        { status: 400 }
      );
    }

    const cleanDomain = domainName.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Extract vercel project name from vercelUrl if available, or generate from business name
    let vercelProjectName = project.vercelUrl
      ? new URL(project.vercelUrl).hostname.split('.')[0]
      : `lp-${project.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const url = new URL(`https://api.vercel.com/v10/projects/${vercelProjectName}/domains`);
    if (dbSettings.vercel_team_id) {
      url.searchParams.set('teamId', dbSettings.vercel_team_id);
    }

    const vercelRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: cleanDomain }),
    });

    const resData = await vercelRes.json();

    if (!vercelRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: resData.error?.message || 'Falha ao registrar domínio na Vercel.',
        },
        { status: vercelRes.status }
      );
    }

    // Update project with custom domain
    await updateProject(projectId, {
      customDomain: cleanDomain,
    });

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: resData.verified,
      dnsRecords: {
        typeA: {
          name: '@',
          type: 'A',
          value: '76.76.21.21',
        },
        cname: {
          name: 'www',
          type: 'CNAME',
          value: 'cname.vercel-dns.com',
        },
      },
      message: `Domínio ${cleanDomain} vinculado com sucesso! Aponte as entradas DNS no seu provedor de domínio.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
