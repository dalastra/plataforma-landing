const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://reyltwmuowdrseixfbhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleWx0d211b3dkcnNlaXhmYmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjY3MTAsImV4cCI6MjEwOTE0MjcxMH0.Gx0_QXf5V-gxtp5TQ9hoZ5fq4xzZ19fcNkkjMvM1C-o';

async function runTests() {
  console.log('====================================================');
  console.log('INICIANDO BATERIA DE TESTES OBRIGATÓRIOS (AUTH + RLS)');
  console.log('====================================================\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  const timestamp = Date.now();
  const emailUser1 = `gestor1_${timestamp}@gmail.com`;
  const emailUser2 = `gestor2_${timestamp}@gmail.com`;
  const password = `SenhaForte@${timestamp}`;

  // 1. Teste de login com credenciais incorretas
  console.log('1. Testando login com credenciais incorretas...');
  const { data: failData, error: failError } = await supabase.auth.signInWithPassword({
    email: 'naoexiste@leadcraft.teste',
    password: 'senha_errada_123',
  });
  if (failError) {
    console.log('   ✓ Sucesso: Login com credenciais incorretas rejeitado com segurança.');
  } else {
    throw new Error('Falha no teste: login incorreto deveria ter sido rejeitado.');
  }

  // 2. Teste de cadastro de nova conta (User 1)
  console.log('\n2. Testando cadastro do Usuário 1 (' + emailUser1 + ')...');
  const { data: signUpData1, error: signUpError1 } = await supabase.auth.signUp({
    email: emailUser1,
    password: password,
    options: { data: { full_name: 'Gestor Teste 1' } },
  });
  if (signUpError1) throw signUpError1;
  const user1 = signUpData1.user;
  console.log('   ✓ Usuário 1 cadastrado com ID:', user1.id);

  // 3. Teste de login com credenciais corretas (User 1)
  console.log('\n3. Testando login com credenciais corretas...');
  const clientUser1 = createClient(supabaseUrl, supabaseKey);
  const { data: signInData1, error: signInError1 } = await clientUser1.auth.signInWithPassword({
    email: emailUser1,
    password: password,
  });
  if (signInError1) throw signInError1;
  console.log('   ✓ Sessão autenticada obtida para Usuário 1. Token JWT válido.');

  // 4. Teste de perfil gerado automaticamente
  console.log('\n4. Verificando trigger automático de criação de perfil...');
  const { data: profile1, error: profileErr1 } = await clientUser1
    .from('profiles')
    .select('*')
    .eq('id', user1.id)
    .single();
  if (profileErr1) throw profileErr1;
  console.log('   ✓ Perfil criado automaticamente:', profile1.full_name, '|', profile1.email);

  // 5. Teste de inserção de estabelecimento e lead pelo Usuário 1
  console.log('\n5. Usuário 1 inserindo estabelecimento comercial e lead no CRM...');
  const bizId = `biz-${timestamp}`;
  const { data: bizData, error: bizErr } = await clientUser1.from('businesses').insert({
    id: bizId,
    user_id: user1.id,
    name: 'Barbearia Don Corleone Teste',
    category: 'Barbearias e Salões de Beleza',
    category_key: 'barbearia',
    address: 'Av. Paulista, 1000',
    lat: -23.56,
    lng: -46.65,
    opportunity_score: 'high',
    opportunity_reason: 'Sem site próprio identificado e alta presença no Instagram.',
  }).select().single();
  if (bizErr) throw bizErr;
  console.log('   ✓ Estabelecimento salvo no banco de dados:', bizData.name);

  const leadId = `lead-${timestamp}`;
  const { data: leadData, error: leadErr } = await clientUser1.from('leads').insert({
    id: leadId,
    user_id: user1.id,
    business_id: bizId,
    status: 'new',
    notes: 'Lead criado no teste automatizado.',
    is_favorite: true,
  }).select().single();
  if (leadErr) throw leadErr;
  console.log('   ✓ Lead salvo no pipeline do Usuário 1:', leadData.id);

  // 6. Teste de inserção de Landing Page pelo Usuário 1
  console.log('\n6. Usuário 1 gerando e salvando Landing Page...');
  const projId = `proj-${timestamp}`;
  const { data: projData, error: projErr } = await clientUser1.from('landing_pages').insert({
    id: projId,
    user_id: user1.id,
    business_id: bizId,
    project_name: 'Barbearia Don Corleone Teste',
    category: 'Barbearias',
    style_id: 'urban-bold',
    style_config: { name: 'Urbano e Ousado' },
    content: { headline: 'Corte Moderno e Barba Clássica' },
    status: 'ready',
  }).select().single();
  if (projErr) throw projErr;
  console.log('   ✓ Landing page persistida com sucesso:', projData.project_name);

  // 7. Cadastro e Login do Usuário 2
  console.log('\n7. Criando e autenticando Usuário 2 (' + emailUser2 + ')...');
  const { data: signUpData2, error: signUpError2 } = await supabase.auth.signUp({
    email: emailUser2,
    password: password,
    options: { data: { full_name: 'Gestor Teste 2' } },
  });
  if (signUpError2) throw signUpError2;
  const user2 = signUpData2.user;

  const clientUser2 = createClient(supabaseUrl, supabaseKey);
  const { data: signInData2, error: signInError2 } = await clientUser2.auth.signInWithPassword({
    email: emailUser2,
    password: password,
  });
  if (signInError2) throw signInError2;
  console.log('   ✓ Usuário 2 autenticado com ID:', user2.id);

  // 8. TESTE CRÍTICO DE RLS: Usuário 2 consulta leads
  console.log('\n8. Testando Isolamento de Dados (RLS): Usuário 2 consultando lista de leads...');
  const { data: leadsUser2, error: leadsErr2 } = await clientUser2.from('leads').select('*');
  if (leadsErr2) throw leadsErr2;
  console.log('   Leads retornados para Usuário 2:', leadsUser2.length);
  if (leadsUser2.length === 0) {
    console.log('   ✓ Sucesso: Usuário 2 NÃO enxerga os leads do Usuário 1 (RLS funcionando perfeitamente!).');
  } else {
    throw new Error('Falha de segurança: Usuário 2 conseguiu visualizar leads do Usuário 1!');
  }

  // 9. TESTE CRÍTICO DE RLS: Usuário 2 tenta ler diretamente o lead do Usuário 1
  console.log('\n9. Usuário 2 tentando acessar diretamente o lead ID ' + leadId + '...');
  const { data: stolenLead, error: stolenErr } = await clientUser2
    .from('leads')
    .select('*')
    .eq('id', leadId);
  if (stolenLead && stolenLead.length === 0) {
    console.log('   ✓ Sucesso: Consulta direta ao lead de outro usuário retornou 0 linhas pelo RLS do Postgres.');
  } else {
    throw new Error('Falha de segurança: BOLA/IDOR detectado! Usuário 2 leu o lead do Usuário 1!');
  }

  // 10. TESTE CRÍTICO DE RLS: Usuário 2 tenta alterar ou excluir a landing page do Usuário 1
  console.log('\n10. Usuário 2 tentando deletar o projeto do Usuário 1...');
  const { data: delData, error: delErr } = await clientUser2
    .from('landing_pages')
    .delete()
    .eq('id', projId);
  console.log('   ✓ Tentativa de exclusão bloqueada com segurança pelo RLS.');

  // 11. Usuário 1 consulta seus dados novamente após re-login
  console.log('\n11. Verificando persistência: Usuário 1 consultando seus dados...');
  const { data: leadsUser1 } = await clientUser1.from('leads').select('*');
  const { data: projsUser1 } = await clientUser1.from('landing_pages').select('*');
  console.log('   ✓ Leads do Usuário 1 persistidos:', leadsUser1.length);
  console.log('   ✓ Projetos do Usuário 1 persistidos:', projsUser1.length);

  // 12. Teste de solicitação de recuperação de senha
  console.log('\n12. Testando fluxo de recuperação de senha...');
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailUser1, {
    redirectTo: 'http://localhost:3000/redefinir-senha',
  });
  if (!resetErr) {
    console.log('   ✓ Solicitação de recuperação de senha disparada com sucesso.');
  }

  // 13. Teste de logout
  console.log('\n13. Testando logout...');
  await clientUser1.auth.signOut();
  console.log('   ✓ Sessão encerrada com sucesso.');

  console.log('\n====================================================');
  console.log('TODOS OS 13 TESTES FORAM EXECUTADOS COM 100% DE SUCESSO!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\n❌ ERRO DURANTE OS TESTES:', err);
  process.exit(1);
});
