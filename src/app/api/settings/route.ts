import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSettings, saveUserSettings } from '@/lib/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const settings = await getUserSettings(user.id);
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        hasGeminiKey: Boolean(settings.geminiApiKey),
        hasGooglePlacesKey: Boolean(settings.googlePlacesApiKey),
        geminiApiKey: settings.geminiApiKey,
        googlePlacesApiKey: settings.googlePlacesApiKey,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
    const updated = await saveUserSettings(user.id, body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
