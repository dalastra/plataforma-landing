import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserLeads } from '@/lib/db';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const leads = await getUserLeads(user.id);

    // Build CSV with BOM for Excel compatibility (UTF-8)
    const headers = [
      'ID',
      'Nome do Estabelecimento',
      'Categoria',
      'Status no Funil',
      'Valor Proposta (R$)',
      'Telefone / WhatsApp',
      'Instagram',
      'Possui Site Proprio?',
      'Avaliacao',
      'Numero Avaliacoes',
      'Visualizacoes Demo',
      'Ultima Visualizacao Demo',
      'Endereco',
      'Observacoes',
      'Data Criacao',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.id),
      escapeCsv(l.business.name),
      escapeCsv(l.business.category),
      escapeCsv(l.status),
      escapeCsv(l.dealValue || 0),
      escapeCsv(l.business.whatsapp || l.business.phone || ''),
      escapeCsv(l.business.instagram || ''),
      escapeCsv(l.business.websiteStatus === 'own_website' ? 'Sim' : 'Nao'),
      escapeCsv(l.business.rating || ''),
      escapeCsv(l.business.reviewCount || ''),
      escapeCsv(l.demoViewsCount || 0),
      escapeCsv(l.lastDemoViewedAt ? new Date(l.lastDemoViewedAt).toLocaleString('pt-BR') : ''),
      escapeCsv(l.business.address || ''),
      escapeCsv(l.notes || ''),
      escapeCsv(new Date(l.createdAt).toLocaleDateString('pt-BR')),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leadcraft-crm-leads-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
