import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateLandingPageProject } from '@/lib/generator';
import { getUserSettings, saveUserProject, saveUserLead, getUserLeads } from '@/lib/db';
import { Business, LandingPageStyle, Lead } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { business, style }: { business: Business; style?: LandingPageStyle } = body;

    if (!business || !business.name) {
      return NextResponse.json(
        { success: false, error: 'Dados do estabelecimento não informados.' },
        { status: 400 }
      );
    }

    const settings = await getUserSettings(user.id);
    const project = await generateLandingPageProject(
      business,
      style,
      settings.geminiApiKey
    );

    // Save project in database isolated to user
    await saveUserProject(user.id, project);

    // Also link/update Lead in CRM
    const leads = await getUserLeads(user.id);
    const existingLead = leads.find((l) => l.businessId === business.id);

    const leadRecord: Lead = {
      id: existingLead ? existingLead.id : `lead-${Date.now()}`,
      businessId: business.id,
      business,
      status: 'landing_page_created',
      projectId: project.id,
      notes: existingLead ? existingLead.notes : `Landing page gerada no estilo ${project.style.name}.`,
      isFavorite: existingLead ? existingLead.isFavorite : false,
      lastContactDate: existingLead?.lastContactDate,
      createdAt: existingLead ? existingLead.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserLead(user.id, leadRecord);

    return NextResponse.json({
      success: true,
      project,
      lead: leadRecord,
    });
  } catch (error: any) {
    console.error('API /api/landing-pages/generate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar landing page' },
      { status: 500 }
    );
  }
}
