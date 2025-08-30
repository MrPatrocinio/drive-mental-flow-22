import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title="Política de Privacidade" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Política de Privacidade</CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introdução</h2>
              <p className="mb-4">
                A Drive Mental valoriza sua privacidade e está comprometida em proteger suas informações pessoais. 
                Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Informações que Coletamos</h2>
              
              <h3 className="text-xl font-medium mb-3">Informações de Cadastro</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Dados de pagamento (processados de forma segura)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Informações de Uso</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Histórico de áudios reproduzidos</li>
                <li>Preferências de conteúdo</li>
                <li>Tempo de uso da plataforma</li>
                <li>Dispositivos utilizados</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Informações Técnicas</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Endereço IP</li>
                <li>Tipo de navegador</li>
                <li>Sistema operacional</li>
                <li>Dados de localização aproximada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Como Utilizamos suas Informações</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Garantir a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
                <li>Realizar análises para melhoria do produto</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Compartilhamento de Informações</h2>
              <p className="mb-4">Não vendemos suas informações pessoais. Compartilhamos dados apenas quando:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Necessário para prestação do serviço (ex: processadores de pagamento)</li>
                <li>Exigido por lei ou autoridade competente</li>
                <li>Para proteger nossos direitos legais</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Cookies e Tecnologias Similares</h2>
              <p className="mb-4">Utilizamos cookies para:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Manter você conectado</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso da plataforma</li>
                <li>Melhorar a performance do site</li>
              </ul>
              <p className="mb-4">
                Você pode gerenciar cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Segurança dos Dados</h2>
              <p className="mb-4">Implementamos medidas de segurança incluindo:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Auditorias regulares de segurança</li>
                <li>Treinamento de equipe sobre proteção de dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Retenção de Dados</h2>
              <p className="mb-4">
                Mantemos suas informações apenas pelo tempo necessário para cumprir as finalidades descritas 
                nesta política ou conforme exigido por lei. Dados de conta cancelada são excluídos após 
                período de retenção legal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Seus Direitos</h2>
              <p className="mb-4">Você tem o direito de:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir informações incorretas</li>
                <li>Solicitar exclusão de dados</li>
                <li>Revogar consentimentos</li>
                <li>Exportar seus dados</li>
                <li>Limitar o processamento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Menores de Idade</h2>
              <p className="mb-4">
                Nossos serviços são destinados a usuários maiores de 18 anos. Não coletamos intencionalmente 
                dados de menores sem consentimento dos pais ou responsáveis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Alterações na Política</h2>
              <p className="mb-4">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
                por e-mail ou através da plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contato</h2>
              <p className="mb-4">
                Para questões sobre privacidade ou para exercer seus direitos, contate-nos em: 
                privacidade@drivemental.com
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

export default PrivacyPolicyPage;