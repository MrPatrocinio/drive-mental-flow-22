import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Shield, Brain, Zap, Target, Heart, Clock, ChevronDown, Headphones, Sparkles, X, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/assinatura');
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Transformação em 21 dias</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Se você não controla sua mente,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              ela controla você.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Padrões de autossabotagem. Procrastinação disfarçada de cansaço. Falta de foco que destrói seus dias e seus sonhos.
            <br /><br />
            Você já tentou mudar isso antes — mas sempre volta pro mesmo ponto.
            <br /><br />
            A culpa não é sua. É da <strong className="text-foreground">programação mental que você repete há anos sem perceber.</strong>
          </p>
          
          <Button 
            size="lg" 
            onClick={handleCTA}
            className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-2xl shadow-primary/25"
          >
            <Brain className="w-5 h-5 mr-2" />
            QUERO REPROGRAMAR MINHA MENTE
          </Button>
          
          <div className="mt-12 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
            <span className="text-sm">Descubra como funciona</span>
            <ChevronDown className="w-5 h-5" onClick={() => scrollToSection('beneficios')} />
          </div>
        </div>
      </section>

      {/* Benefícios Section */}
      <section id="beneficios" className="py-24 bg-card/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              O que muda quando sua mente trabalha{' '}
              <span className="text-primary">por você</span>?
            </h2>
            <p className="text-muted-foreground text-lg">(e não contra você)</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Foco sob comando',
                description: 'Pare de se distrair. Comece e termine com leveza.'
              },
              {
                icon: Heart,
                title: 'Disciplina emocional',
                description: 'Controle real sobre impulsos e emoções.'
              },
              {
                icon: Shield,
                title: 'Fim da autossabotagem',
                description: 'Pare de se travar antes mesmo de agir.'
              },
              {
                icon: Zap,
                title: 'Mente leve, corpo em ação',
                description: 'Produtividade sem sobrecarga.'
              },
              {
                icon: Sparkles,
                title: 'Confiança crescente',
                description: 'Progresso diário, visível em você.'
              },
              {
                icon: Brain,
                title: 'Clareza mental',
                description: 'Decisões certeiras, sem ansiedade.'
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simples. Científico.{' '}
              <span className="text-primary">Funciona.</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Acesse a plataforma',
                description: 'Entre na plataforma exclusiva Drive Mental.'
              },
              {
                step: '02',
                title: 'Ouça 1 áudio por dia',
                description: 'Apenas 7 a 10 minutos do seu tempo.'
              },
              {
                step: '03',
                title: 'Siga as orientações',
                description: 'Práticas guiadas simples e eficazes.'
              },
              {
                step: '04',
                title: 'Transforme-se em 21 dias',
                description: 'Sua mente operando em um novo padrão.'
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-lg px-10 py-7 rounded-full"
            >
              COMEÇAR AGORA
            </Button>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pessoas reais.{' '}
              <span className="text-primary">Mudanças reais.</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'No terceiro dia, eu já senti diferença. Tinha clareza mental, menos ansiedade. Hoje sou outra pessoa.',
                author: 'Rafael',
                role: 'Designer, 31 anos'
              },
              {
                quote: 'Acordo, coloco o fone e o Drive Mental já muda meu estado. Foco, presença e vontade de agir.',
                author: 'Lívia',
                role: 'Arquiteta, 28 anos'
              },
              {
                quote: 'Foi o primeiro método que realmente funcionou pra mim. E olha que eu já tentei de tudo.',
                author: 'Daniel',
                role: 'Empreendedor, 34 anos'
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-background border border-border relative"
              >
                <div className="absolute -top-4 left-8 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-foreground mb-6 relative z-10 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section id="precos" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Escolha seu plano de{' '}
              <span className="text-primary">transformação</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Investimento menor que uma pizza por semana para mudar sua vida
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Plano Básico */}
            <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Mensal</h3>
                <p className="text-muted-foreground text-sm">Para experimentar</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 47</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  { included: true, text: 'Acesso à plataforma' },
                  { included: true, text: 'Áudios de reprogramação' },
                  { included: true, text: 'Suporte por email' },
                  { included: false, text: 'Conteúdos exclusivos' },
                  { included: false, text: 'Comunidade VIP' },
                  { included: false, text: 'Sessões ao vivo' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {item.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={item.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full py-6"
                onClick={handleCTA}
              >
                Começar agora
              </Button>
            </div>
            
            {/* Plano Recomendado */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-primary/10 to-background border-2 border-primary shadow-xl shadow-primary/10 scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  Mais popular
                </span>
              </div>
              
              <div className="mb-6 pt-2">
                <h3 className="text-xl font-bold mb-2">Anual</h3>
                <p className="text-muted-foreground text-sm">Melhor custo-benefício</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 29</span>
                <span className="text-muted-foreground">/mês</span>
                <p className="text-sm text-primary mt-1">Economia de 38%</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  { included: true, text: 'Acesso à plataforma' },
                  { included: true, text: 'Áudios de reprogramação' },
                  { included: true, text: 'Suporte prioritário' },
                  { included: true, text: 'Conteúdos exclusivos' },
                  { included: true, text: 'Comunidade VIP' },
                  { included: false, text: 'Sessões ao vivo' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {item.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={item.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full py-6 bg-gradient-to-r from-primary to-accent"
                onClick={handleCTA}
              >
                <Zap className="w-4 h-4 mr-2" />
                Escolher plano anual
              </Button>
            </div>
            
            {/* Plano Premium */}
            <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Vitalício</h3>
                <p className="text-muted-foreground text-sm">Acesso para sempre</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ 497</span>
                <span className="text-muted-foreground"> único</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  { included: true, text: 'Acesso à plataforma' },
                  { included: true, text: 'Áudios de reprogramação' },
                  { included: true, text: 'Suporte VIP' },
                  { included: true, text: 'Conteúdos exclusivos' },
                  { included: true, text: 'Comunidade VIP' },
                  { included: true, text: 'Sessões ao vivo' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {item.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={item.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full py-6"
                onClick={handleCTA}
              >
                Acesso vitalício
              </Button>
            </div>
          </div>
          
          {/* Comparativo rápido */}
          <div className="mt-16 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Comparativo</th>
                  <th className="text-center py-4 px-4 font-medium">Mensal</th>
                  <th className="text-center py-4 px-4 font-medium text-primary">Anual</th>
                  <th className="text-center py-4 px-4 font-medium">Vitalício</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Áudios ilimitados', mensal: true, anual: true, vitalicio: true },
                  { feature: 'Novos conteúdos mensais', mensal: true, anual: true, vitalicio: true },
                  { feature: 'Conteúdos exclusivos', mensal: false, anual: true, vitalicio: true },
                  { feature: 'Comunidade VIP', mensal: false, anual: true, vitalicio: true },
                  { feature: 'Sessões ao vivo', mensal: false, anual: false, vitalicio: true },
                  { feature: 'Suporte prioritário', mensal: false, anual: true, vitalicio: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.mensal ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-primary/5">
                      {row.anual ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.vitalicio ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Garantia Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🛡️ Garantia total de 7 dias
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Se não sentir mudanças reais nos primeiros dias, devolvemos <strong className="text-foreground">100% do seu investimento</strong>.
              <br /><br />
              Você só continua se fizer sentido pra você.
            </p>
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-lg px-10 py-7 rounded-full bg-gradient-to-r from-primary to-accent"
            >
              ATIVAR MEU DRIVE MENTAL AGORA
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Principal Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Headphones className="w-20 h-20 text-primary mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Comece agora a mente que vai{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              mudar seu destino.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sem tempo? Já tentou de tudo? O Drive Mental foi feito pra você.
            <br />
            Em 7 minutos por dia, você muda o que anos de tentativa e erro não mudaram.
          </p>
          <Button 
            size="lg" 
            onClick={handleCTA}
            className="text-lg px-12 py-8 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-2xl shadow-primary/25"
          >
            <Zap className="w-5 h-5 mr-2" />
            QUERO EXPERIMENTAR AGORA
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas frequentes
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: 'Preciso ouvir todos os dias?',
                answer: 'Sim. São apenas 7 a 10 minutos, e o impacto só acontece com consistência.'
              },
              {
                question: 'E se eu perder um dia?',
                answer: 'Tudo bem. Você continua de onde parou. O importante é retomar e seguir.'
              },
              {
                question: 'Esses áudios realmente funcionam?',
                answer: 'Sim. São baseados em princípios científicos validados como neuroplasticidade e condicionamento cognitivo.'
              },
              {
                question: 'Já tentei de tudo. Isso é diferente como?',
                answer: 'Diferente porque atua direto no sistema que comanda tudo: sua mente subconsciente.'
              },
              {
                question: 'É caro?',
                answer: 'Caro é continuar preso nos mesmos padrões. O Drive Mental custa menos que uma pizza por semana.'
              }
            ].map((faq, index) => (
              <details 
                key={index}
                className="group p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <summary className="flex items-center justify-between font-bold text-lg list-none">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Button 
            size="lg" 
            onClick={handleCTA}
            className="text-lg px-10 py-7 rounded-full"
          >
            COMEÇAR MINHA TRANSFORMAÇÃO
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Garantia de 7 dias • Acesso imediato • Suporte incluído
          </p>
        </div>
      </section>
    </div>
  );
};

export default LpPage;
