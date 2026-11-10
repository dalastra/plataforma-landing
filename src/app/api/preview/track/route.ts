import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch project to see current views & business
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

    // 2. Update landing_pages
    await supabase
      .from('landing_pages')
      .update({
        demo_views_count: newViewsCount,
        last_demo_viewed_at: now,
      })
      .eq('id', projectId);

    // 3. Log event into demo_views
    await supabase.from('demo_views').insert({
      landing_page_id: projectId,
      business_id: project.business_id,
      user_agent: req.headers.get('user-agent') || 'unknown',
      viewed_at: now,
    });

    // 4. Update corresponding lead if exists
    if (project.business_id && project.user_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id, status, demo_views_count')
        .eq('user_id', project.user_id)
        .eq('business_id', project.business_id)
        .single();

      if (lead) {
        const leadUpdates: any = {
          demo_views_count: (lead.demo_views_count || 0) + 1,
          last_demo_viewed_at: now,
          updated_at: now,
        };

        // Advance to demo_viewed if previous status was new, analyzed, or contacted
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
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
