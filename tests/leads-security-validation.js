/**
 * Script de Validação de Segurança - Tabela LEADS
 * 
 * INSTRUÇÕES:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este script completo e pressione Enter
 * 3. Execute: await validateLeadsSecurity()
 * 4. Aguarde os resultados (leva ~10-15 segundos)
 * 
 * O script testará:
 * ✅ INSERT público (deve funcionar)
 * ❌ SELECT público (deve falhar)
 * ❌ SELECT usuário comum (deve falhar)
 * ✅ SELECT admin (deve funcionar)
 * ❌ UPDATE/DELETE não-admin (deve falhar)
 * ✅ UPDATE/DELETE admin (deve funcionar)
 */

import { supabase } from '@/integrations/supabase/client';

// Utilitários
const TEST_EMAIL = `test-lead-${Date.now()}@security.test`;
const COLORS = {
  success: 'color: #10b981; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  info: 'color: #3b82f6; font-weight: bold',
  warning: 'color: #f59e0b; font-weight: bold'
};

const log = (message, type = 'info') => {
  console.log(`%c${message}`, COLORS[type]);
};

const logTest = (testName, expected, actual) => {
  const passed = expected === actual;
  const icon = passed ? '✅' : '❌';
  const style = passed ? COLORS.success : COLORS.error;
  console.log(`%c${icon} ${testName}`, style);
  console.log(`   Esperado: ${expected} | Obtido: ${actual}`);
  return passed;
};

// Testes
const tests = {
  results: [],
  
  async testPublicInsert() {
    log('\n🧪 TESTE 1: INSERT público (anônimo)', 'info');
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: 'Teste Público',
          email: TEST_EMAIL,
          phone: '11999999999',
          source: 'test_script'
        }])
        .select()
        .single();

      const passed = logTest(
        'INSERT público deve FUNCIONAR',
        'sucesso',
        error ? 'erro' : 'sucesso'
      );
      
      if (data) {
        console.log('   Lead criado:', data.id);
        this.testLeadId = data.id;
      }
      
      this.results.push({ test: 'Public INSERT', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'Public INSERT', passed: false, error: err.message });
      return false;
    }
  },

  async testPublicSelect() {
    log('\n🧪 TESTE 2: SELECT público (anônimo)', 'info');
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

      const passed = logTest(
        'SELECT público deve FALHAR ou retornar vazio',
        'bloqueado',
        (error || (data && data.length === 0)) ? 'bloqueado' : 'permitido'
      );

      if (error) {
        console.log('   Erro esperado:', error.message);
      }
      
      this.results.push({ test: 'Public SELECT', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'Public SELECT', passed: false, error: err.message });
      return false;
    }
  },

  async testUserSelect() {
    log('\n🧪 TESTE 3: SELECT usuário comum autenticado', 'info');
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      log('⚠️  AVISO: Não há usuário autenticado. Faça login para testar.', 'warning');
      this.results.push({ test: 'User SELECT', passed: null, error: 'Não autenticado' });
      return null;
    }

    // Verificar role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role === 'admin') {
      log('⚠️  AVISO: Usuário atual é ADMIN. Teste de usuário comum ignorado.', 'warning');
      this.results.push({ test: 'User SELECT', passed: null, error: 'Usuário é admin' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

      const passed = logTest(
        'SELECT usuário comum deve FALHAR',
        'bloqueado',
        (error || (data && data.length === 0)) ? 'bloqueado' : 'permitido'
      );

      if (error) {
        console.log('   Erro esperado:', error.message);
      }
      
      this.results.push({ test: 'User SELECT', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'User SELECT', passed: false, error: err.message });
      return false;
    }
  },

  async testAdminSelect() {
    log('\n🧪 TESTE 4: SELECT usuário ADMIN', 'info');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      log('⚠️  AVISO: Não há usuário autenticado. Faça login como admin para testar.', 'warning');
      this.results.push({ test: 'Admin SELECT', passed: null, error: 'Não autenticado' });
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      log('⚠️  AVISO: Usuário atual NÃO é admin. Faça login como admin para testar.', 'warning');
      this.results.push({ test: 'Admin SELECT', passed: null, error: 'Não é admin' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(5);

      const passed = logTest(
        'SELECT admin deve FUNCIONAR',
        'sucesso',
        (!error && data && data.length > 0) ? 'sucesso' : 'erro'
      );

      if (data) {
        console.log(`   Leads retornados: ${data.length}`);
      }
      
      this.results.push({ test: 'Admin SELECT', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'Admin SELECT', passed: false, error: err.message });
      return false;
    }
  },

  async testNonAdminUpdate() {
    log('\n🧪 TESTE 5: UPDATE por não-admin', 'info');
    
    if (!this.testLeadId) {
      log('⚠️  AVISO: Nenhum lead de teste criado. Pulando teste.', 'warning');
      this.results.push({ test: 'Non-Admin UPDATE', passed: null, error: 'Sem lead de teste' });
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user ? await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single() : { data: null };

    if (profile?.role === 'admin') {
      log('⚠️  AVISO: Usuário é admin. Teste ignorado.', 'warning');
      this.results.push({ test: 'Non-Admin UPDATE', passed: null, error: 'Usuário é admin' });
      return null;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ name: 'Tentativa de Update' })
        .eq('id', this.testLeadId);

      const passed = logTest(
        'UPDATE não-admin deve FALHAR',
        'bloqueado',
        error ? 'bloqueado' : 'permitido'
      );

      if (error) {
        console.log('   Erro esperado:', error.message);
      }
      
      this.results.push({ test: 'Non-Admin UPDATE', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'Non-Admin UPDATE', passed: false, error: err.message });
      return false;
    }
  },

  async testAdminDelete() {
    log('\n🧪 TESTE 6: DELETE por admin (limpeza)', 'info');
    
    if (!this.testLeadId) {
      log('⚠️  AVISO: Nenhum lead de teste para deletar.', 'warning');
      this.results.push({ test: 'Admin DELETE', passed: null, error: 'Sem lead de teste' });
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      log('⚠️  AVISO: Não há usuário autenticado. Lead de teste não foi removido.', 'warning');
      this.results.push({ test: 'Admin DELETE', passed: null, error: 'Não autenticado' });
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      log('⚠️  AVISO: Usuário não é admin. Lead de teste não foi removido.', 'warning');
      this.results.push({ test: 'Admin DELETE', passed: null, error: 'Não é admin' });
      return null;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', this.testLeadId);

      const passed = logTest(
        'DELETE admin deve FUNCIONAR',
        'sucesso',
        error ? 'erro' : 'sucesso'
      );

      if (!error) {
        console.log('   Lead de teste removido com sucesso');
      }
      
      this.results.push({ test: 'Admin DELETE', passed, error: error?.message });
      return passed;
    } catch (err) {
      console.error('Erro inesperado:', err);
      this.results.push({ test: 'Admin DELETE', passed: false, error: err.message });
      return false;
    }
  },

  printSummary() {
    log('\n═══════════════════════════════════════', 'info');
    log('📊 RESUMO DOS TESTES', 'info');
    log('═══════════════════════════════════════', 'info');
    
    const passed = this.results.filter(r => r.passed === true).length;
    const failed = this.results.filter(r => r.passed === false).length;
    const skipped = this.results.filter(r => r.passed === null).length;
    const total = this.results.length;

    console.table(this.results);
    
    log(`\n✅ Passou: ${passed}/${total}`, 'success');
    log(`❌ Falhou: ${failed}/${total}`, failed > 0 ? 'error' : 'info');
    log(`⚠️  Ignorado: ${skipped}/${total}`, 'warning');
    
    if (failed === 0 && passed > 0) {
      log('\n🎉 TODAS AS VALIDAÇÕES DE SEGURANÇA PASSARAM!', 'success');
    } else if (failed > 0) {
      log('\n⚠️  ATENÇÃO: Alguns testes falharam. Revise as políticas RLS.', 'error');
    }
    
    log('\n═══════════════════════════════════════\n', 'info');
  }
};

// Função principal
async function validateLeadsSecurity() {
  log('🔒 INICIANDO VALIDAÇÃO DE SEGURANÇA - TABELA LEADS', 'info');
  log('═══════════════════════════════════════════════════\n', 'info');
  
  try {
    await tests.testPublicInsert();
    await tests.testPublicSelect();
    await tests.testUserSelect();
    await tests.testAdminSelect();
    await tests.testNonAdminUpdate();
    await tests.testAdminDelete();
    
    tests.printSummary();
  } catch (error) {
    log('\n❌ ERRO CRÍTICO DURANTE OS TESTES', 'error');
    console.error(error);
  }
}

// Exportar para uso no console
window.validateLeadsSecurity = validateLeadsSecurity;

console.log('%c📋 Script de validação carregado!', 'color: #10b981; font-weight: bold; font-size: 14px');
console.log('%cExecute: validateLeadsSecurity()', 'color: #3b82f6; font-weight: bold');
