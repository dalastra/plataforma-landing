import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 1. Try secure Postgres RPC function (handles RLS bypass safely for view counts)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('record_demo_view', {
      p_project_id: projectId,
      p_user_agent: userAgent,
    });

    if (!rpcErr && rpcData?.success) {
      return NextResponse.json({
        success: true,
        viewsCount: rpcData.viewsCount,
        lastViewedAt: rpcData.lastViewedAt,
      });
    }

    // 2. Fallback direct update for authenticated user owner
    const { data: project, error: projErr } = await supabase
      .from('landing_pages')
      .select('id, user_id, business_id, demo_views_count')
      .eq('id', projectId)
      .single();

    if (projErr || !project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const newViewsCount = (project.demo_views_count || 0) + 1;
    const now = new Date().toISOString();

    await supabase
      .from('landing_pages')
      .update({
        demo_views_count: newViewsCount,
        last_demo_viewed_at: now,
      })
      .eq('id', projectId);

    await supabase.from('demo_views').insert({
      landing_page_id: projectId,
      business_id: project.business_id,
      user_agent: userAgent,
      viewed_at: now,
    });

    if (project.business_id && project.user_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id, status, demo_views_count')
        .eq('user_id', project.user_id)
        .eq('business_id', project.business_id)
        .single();

      if (lead) {
        const leadUpdates: Record<string, unknown> = {
          demo_views_count: (lead.demo_views_count || 0) + 1,
          last_demo_viewed_at: now,
          updated_at: now,
        };

        if (
          lead.status === 'new' ||
          lead.status === 'analyzed' ||
          lead.status === 'landing_page_created' ||
          lead.status === 'contacted'
        ) {
          leadUpdates.status = 'demo_viewed';
        }

        await supabase
          .from('leads')
          .update(leadUpdates)
          .eq('id', lead.id);
      }
    }

    return NextResponse.json({
      success: true,
      viewsCount: newViewsCount,
      lastViewedAt: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

