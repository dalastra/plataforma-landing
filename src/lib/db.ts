import { createClient } from '@/lib/supabase/server';
import { Lead, LandingPageProject, AppSettings, Business } from '@/types';

// Convert DB business row to frontend Business type
function mapBusinessRow(row: any): Business {
  const collected = row.collected_data || {};
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryKey: row.category_key,
    address: row.address,
    neighborhood: collected.neighborhood,
    city: collected.city,
    lat: row.lat,
    lng: row.lng,
    distanceKm: row.distance_km ? Number(row.distance_km) : undefined,
    phone: row.phone || undefined,
    whatsapp: row.whatsapp || undefined,
    instagram: row.instagram || undefined,
    websiteUrl: row.website_url || undefined,
    websiteStatus: row.website_status as any,
    rating: row.rating ? Number(row.rating) : undefined,
    reviewCount: row.review_count || undefined,
    openingHours: collected.openingHours || undefined,
    photos: collected.photos || [],
    services: collected.services || [],
    opportunityScore: row.opportunity_score as any,
    opportunityReason: row.opportunity_reason || '',
    verifiedFields: collected.verifiedFields || {
      hasPhysicalLocation: true,
      hasPhone: Boolean(row.phone || row.whatsapp),
      hasSocial: Boolean(row.instagram),
      hasReviews: Boolean(row.review_count && row.review_count > 0),
    },
  };
}

// Convert DB lead row + business join to Lead type
function mapLeadRow(row: any): Lead {
  return {
    id: row.id,
    businessId: row.business_id,
    business: row.business ? mapBusinessRow(row.business) : ({} as any),
    status: row.status as any,
    projectId: row.project_id || undefined,
    notes: row.notes || '',
    isFavorite: Boolean(row.is_favorite),
    firstContactAt: row.first_contact_at || undefined,
    lastContactDate: row.last_contact_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert DB landing page row to LandingPageProject
function mapProjectRow(row: any): LandingPageProject {
  return {
    id: row.id,
    businessId: row.business_id || '',
    businessName: row.project_name,
    category: row.category || 'Geral',
    style: row.style_config,
    content: row.content,
    htmlContent: row.html_content || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as any,
    vercelUrl: row.vercel_url || undefined,
  };
}

// ----------------- LEADS & BUSINESSES -----------------

export async function getUserLeads(userId: string): Promise<Lead[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('leads')
    .select('*, business:businesses(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads from Supabase:', error);
    return [];
  }

  return (data || []).map(mapLeadRow);
}

export async function saveUserLead(userId: string, lead: Lead): Promise<Lead | null> {
  const supabase = await createClient();

  // 1. Ensure business is saved/upserted in businesses table first
  const biz = lead.business;
  if (biz && biz.id) {
    const bizRow = {
      id: biz.id,
      user_id: userId,
      name: biz.name,
      category: biz.category,
      category_key: biz.categoryKey || 'geral',
      address: biz.address || 'Endereço comercial',
      phone: biz.phone || null,
      whatsapp: biz.whatsapp || null,
      instagram: biz.instagram || null,
      website_url: biz.websiteUrl || null,
      website_status: biz.websiteStatus || 'unconfirmed',
      rating: biz.rating || null,
      review_count: biz.reviewCount || null,
      lat: biz.lat || -23.55,
      lng: biz.lng || -46.63,
      distance_km: biz.distanceKm || null,
      opportunity_score: biz.opportunityScore || 'medium',
      opportunity_reason: biz.opportunityReason || '',
      collected_data: {
        neighborhood: biz.neighborhood,
        city: biz.city,
        openingHours: biz.openingHours,
        photos: biz.photos,
        services: biz.services,
        verifiedFields: biz.verifiedFields,
      },
    };

    const { error: bizErr } = await supabase
      .from('businesses')
      .upsert(bizRow, { onConflict: 'id' });

    if (bizErr) {
      console.error('Error upserting business in Supabase:', bizErr);
    }
  }

  // 2. Upsert lead row
  const leadRow = {
    id: lead.id,
    user_id: userId,
    business_id: lead.businessId,
    project_id: lead.projectId || null,
    status: lead.status || 'new',
    notes: lead.notes || '',
    is_favorite: Boolean(lead.isFavorite),
    last_contact_at: lead.lastContactDate || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('leads')
    .upsert(leadRow, { onConflict: 'id' })
    .select('*, business:businesses(*)')
    .single();

  if (error) {
    console.error('Error saving lead in Supabase:', error);
    return null;
  }

  return mapLeadRow(data);
}

export async function updateUserLead(
  userId: string,
  leadId: string,
  updates: Partial<Lead>
): Promise<Lead | null> {
  const supabase = await createClient();

  const patch: any = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.notes !== undefined) patch.notes = updates.notes;
  if (updates.isFavorite !== undefined) patch.is_favorite = updates.isFavorite;
  if (updates.lastContactDate !== undefined) patch.last_contact_at = updates.lastContactDate;
  if (updates.projectId !== undefined) patch.project_id = updates.projectId;

  const { data, error } = await supabase
    .from('leads')
    .update(patch)
    .eq('id', leadId)
    .eq('user_id', userId)
    .select('*, business:businesses(*)')
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    return null;
  }

  return mapLeadRow(data);
}

export async function deleteUserLead(userId: string, leadId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .eq('user_id', userId);

  return !error;
}

// ----------------- LANDING PAGES / PROJECTS -----------------

export async function getUserProjects(userId: string): Promise<LandingPageProject[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }

  return (data || []).map(mapProjectRow);
}

export async function getProjectById(
  projectId: string,
  userId?: string
): Promise<LandingPageProject | null> {
  const supabase = await createClient();

  let query = supabase.from('landing_pages').select('*').eq('id', projectId);
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();
  if (error || !data) return null;

  return mapProjectRow(data);
}

export async function saveUserProject(
  userId: string,
  project: LandingPageProject
): Promise<LandingPageProject | null> {
  const supabase = await createClient();

  const projectRow = {
    id: project.id,
    user_id: userId,
    business_id: project.businessId || null,
    project_name: project.businessName,
    category: project.category,
    style_id: project.style.id,
    style_config: project.style,
    content: project.content,
    html_content: project.htmlContent || null,
    vercel_url: project.vercelUrl || null,
    demo_url: `/preview/${project.id}`,
    status: project.status || 'ready',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('landing_pages')
    .upsert(projectRow, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error saving project in Supabase:', error);
    return null;
  }

  return mapProjectRow(data);
}

export async function updateProject(
  projectId: string,
  updates: Partial<LandingPageProject>
): Promise<LandingPageProject | null> {
  const supabase = await createClient();

  const updateFields: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.businessName) updateFields.project_name = updates.businessName;
  if (updates.category) updateFields.category = updates.category;
  if (updates.style) {
    updateFields.style_config = updates.style;
    updateFields.style_id = updates.style.id;
  }
  if (updates.content) updateFields.content = updates.content;
  if (updates.htmlContent !== undefined) updateFields.html_content = updates.htmlContent;
  if (updates.status) updateFields.status = updates.status;
  if (updates.vercelUrl !== undefined) updateFields.vercel_url = updates.vercelUrl;

  const { data, error } = await supabase
    .from('landing_pages')
    .update(updateFields)
    .eq('id', projectId)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error updating project:', error);
    return null;
  }

  return mapProjectRow(data);
}

export async function deleteUserProject(userId: string, projectId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('landing_pages')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  return !error;
}

// ----------------- USER SETTINGS -----------------

export async function getUserSettings(userId: string): Promise<AppSettings> {
  const supabase = await createClient();

  const defaultSettings: AppSettings = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    provider: process.env.GEMINI_API_KEY ? 'gemini' : 'heuristic',
    mapProvider: 'osm',
    userCity: 'São Paulo, SP',
    defaultRadiusKm: 5,
    vercelAccessToken: '',
    vercelTeamId: '',
  };

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return defaultSettings;
  }

  return {
    geminiApiKey: data.gemini_api_key || defaultSettings.geminiApiKey,
    googlePlacesApiKey: data.google_places_api_key || defaultSettings.googlePlacesApiKey,
    provider: (data.gemini_api_key || defaultSettings.geminiApiKey) ? 'gemini' : 'heuristic',
    mapProvider: (data.map_provider as any) || 'osm',
    userCity: data.user_city || defaultSettings.userCity,
    defaultRadiusKm: data.default_radius_km || defaultSettings.defaultRadiusKm,
    vercelAccessToken: data.vercel_access_token || '',
    vercelTeamId: data.vercel_team_id || '',
    vercelUser:
      data.vercel_user_info && Object.keys(data.vercel_user_info).length > 0
        ? data.vercel_user_info
        : undefined,
  };
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  const supabase = await createClient();

  const row: any = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (settings.geminiApiKey !== undefined) row.gemini_api_key = settings.geminiApiKey;
  if (settings.googlePlacesApiKey !== undefined) row.google_places_api_key = settings.googlePlacesApiKey;
  if (settings.mapProvider !== undefined) row.map_provider = settings.mapProvider;
  if (settings.userCity !== undefined) row.user_city = settings.userCity;
  if (settings.defaultRadiusKm !== undefined) row.default_radius_km = settings.defaultRadiusKm;
  if (settings.vercelAccessToken !== undefined) row.vercel_access_token = settings.vercelAccessToken;
  if (settings.vercelTeamId !== undefined) row.vercel_team_id = settings.vercelTeamId;
  if (settings.vercelUser !== undefined) row.vercel_user_info = settings.vercelUser;

  await supabase.from('user_settings').upsert(row, { onConflict: 'user_id' });

  return getUserSettings(userId);
}

// ----------------- SEARCH HISTORY -----------------

export async function recordSearchHistory(
  userId: string,
  query: string,
  radiusKm: number,
  categories: string[],
  resultsCount: number
) {
  try {
    const supabase = await createClient();
    await supabase.from('search_history').insert({
      user_id: userId,
      search_query: query,
      radius_km: radiusKm,
      categories,
      results_count: resultsCount,
    });
  } catch (err) {
    console.error('Error logging search history:', err);
  }
}
