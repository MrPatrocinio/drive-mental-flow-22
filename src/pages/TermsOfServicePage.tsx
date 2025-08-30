import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title="Termos de Uso" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Termos de Uso</CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Aceitação dos Termos</h2>
              <p className="mb-4">
                Ao acessar e usar a plataforma Drive Mental, você concorda em cumprir estes Termos de Uso. 
                Se não concordar com qualquer parte destes termos, não use nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Descrição do Serviço</h2>
              <p className="mb-4">
                A Drive Mental é uma plataforma digital que oferece conteúdo de áudio para desenvolvimento 
                pessoal, incluindo meditações, programação mental e técnicas de bem-estar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cadastro e Conta de Usuário</h2>
              
              <h3 className="text-xl font-medium mb-3">Elegibilidade</h3>
              <p className="mb-4">
                Nossos serviços são destinados a usuários maiores de 18 anos ou menores com autorização 
                dos pais/responsáveis.
              </p>

              <h3 className="text-xl font-medium mb-3">Informações da Conta</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Forneça informações verdadeiras e atualizadas</li>
                <li>Mantenha a segurança de sua senha</li>
                <li>Notifique-nos sobre uso não autorizado</li>
                <li>Você é responsável por toda atividade em sua conta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Assinaturas e Pagamentos</h2>
              
              <h3 className="text-xl font-medium mb-3">Planos de Assinatura</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Diferentes planos com recursos específicos</li>
                <li>Cobrança recorrente conforme plano escolhido</li>
                <li>Preços sujeitos a alteração com aviso prévio</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Política de Reembolso</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Cancelamento pode ser feito a qualquer momento</li>
                <li>Reembolsos conforme política específica</li>
                <li>Acesso mantido até o fim do período pago</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Uso Permitido</h2>
              <p className="mb-4">Você pode:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Acessar e usar o conteúdo para uso pessoal</li>
                <li>Fazer download para uso offline (quando disponível)</li>
                <li>Compartilhar experiências de forma não comercial</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Uso Proibido</h2>
              <p className="mb-4">É proibido:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Reproduzir, distribuir ou vender o conteúdo</li>
                <li>Fazer engenharia reversa da plataforma</li>
                <li>Usar para fins comerciais sem autorização</li>
                <li>Compartilhar credenciais de acesso</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Usar de forma prejudicial ou ilegal</li>
                <li>Tentar acessar contas de outros usuários</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Propriedade Intelectual</h2>
              <p className="mb-4">
                Todo conteúdo da plataforma (áudios, textos, imagens, software) é protegido por direitos 
                autorais e outras leis de propriedade intelectual. A Drive Mental detém ou licencia 
                todos os direitos sobre o conteúdo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Disponibilidade do Serviço</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Nos esforçamos para manter alta disponibilidade</li>
                <li>Manutenções programadas serão comunicadas</li>
                <li>Não garantimos disponibilidade 100% do tempo</li>
                <li>Reservamos o direito de modificar ou descontinuar recursos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Limitação de Responsabilidade</h2>
              <p className="mb-4">
                A Drive Mental não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Danos diretos, indiretos ou consequenciais</li>
                <li>Perda de dados ou lucros</li>
                <li>Interrupções do serviço</li>
                <li>Problemas técnicos de terceiros</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cancelamento e Suspensão</h2>
              
              <h3 className="text-xl font-medium mb-3">Por sua parte:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Pode cancelar a qualquer momento</li>
                <li>Dados serão tratados conforme política de privacidade</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Por nossa parte:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Podemos suspender por violação dos termos</li>
                <li>Podemos encerrar com aviso prévio</li>
                <li>Violações graves podem resultar em suspensão imediata</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Lei Aplicável</h2>
              <p className="mb-4">
                Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas nos 
                tribunais competentes do Brasil.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Alterações dos Termos</h2>
              <p className="mb-4">
                Podemos atualizar estes termos periodicamente. Mudanças significativas serão 
                comunicadas com antecedência. O uso continuado após as alterações constitui aceitação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contato</h2>
              <p className="mb-4">
                Para dúvidas sobre estes termos, entre em contato: suporte@drivemental.com
              </p>
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfServicePage;