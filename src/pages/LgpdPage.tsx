import React from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LgpdPage: React.FC = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <Header showBackButton title="LGPD" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Lei Geral de Proteção de Dados (LGPD)</CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Compromisso com a Proteção de Dados</h2>
              <p className="mb-4">
                A Drive Mental está comprometida com a proteção e privacidade dos dados pessoais de seus usuários, 
                em conformidade com a Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Dados Coletados</h2>
              <p className="mb-4">Coletamos apenas os dados estritamente necessários para:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Criar e gerenciar sua conta de usuário</li>
                <li>Fornecer acesso ao conteúdo de áudio</li>
                <li>Processar pagamentos e assinaturas</li>
                <li>Melhorar nossos serviços</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Base Legal</h2>
              <p className="mb-4">O tratamento de seus dados pessoais é realizado com base em:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Consentimento do titular dos dados</li>
                <li>Execução de contrato ou procedimentos preliminares</li>
                <li>Cumprimento de obrigação legal ou regulatória</li>
                <li>Legítimo interesse da Drive Mental</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Seus Direitos</h2>
              <p className="mb-4">Conforme a LGPD, você possui os seguintes direitos:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Confirmação da existência de tratamento de dados</li>
                <li>Acesso aos dados pessoais</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminação dos dados pessoais tratados com consentimento</li>
                <li>Revogação do consentimento</li>
                <li>Oposição ao tratamento realizado com base no legítimo interesse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Segurança dos Dados</h2>
              <p className="mb-4">
                Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais 
                contra tratamento não autorizado ou ilícito, perda, destruição ou danos acidentais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Compartilhamento de Dados</h2>
              <p className="mb-4">
                Seus dados pessoais não são vendidos, alugados ou compartilhados com terceiros, exceto quando:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Necessário para prestação do serviço (processadores de pagamento)</li>
                <li>Exigido por lei ou ordem judicial</li>
                <li>Com seu consentimento expresso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contato</h2>
              <p className="mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, 
                entre em contato conosco através do e-mail: privacidade@drivemental.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Alterações</h2>
              <p className="mb-4">
                Este documento pode ser atualizado periodicamente. A versão mais recente estará sempre 
                disponível em nosso site.
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

export default LgpdPage;