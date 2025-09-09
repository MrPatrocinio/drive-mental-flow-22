/**
 * InscricaoPage - Página de inscrição para captura de leads
 * Responsabilidade: Interface para capturar interessados no Drive Mental (princípio SRP)
 * Princípio SoC: Separação entre UI e lógica de negócio
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { useLeadCapture } from "@/hooks/useLeadCapture";
import { Brain, Heart, Star, Users, CheckCircle, ArrowRight } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export const InscricaoPage = () => {
  const navigate = useNavigate();
  const { submitLead, isLoading, error, clearError } = useLeadCapture();
  const { trackEvent } = useAnalytics();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest_field: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      return;
    }

    const { success } = await submitLead(formData);
    
    if (success) {
      // Redirecionar para página de obrigado
      navigate('/obrigado', { 
        state: { 
          leadName: formData.name,
          leadEmail: formData.email 
        }
      });
    }
  };

  const handleFormFocus = (field: string) => {
    trackEvent('form_field_focus', { field, page: 'inscricao' });
  };

  const benefits = [
    {
      icon: Brain,
      title: "Desenvolvimento Mental",
      description: "Técnicas avançadas para aprimoramento cognitivo e mental"
    },
    {
      icon: Heart,
      title: "Bem-estar Emocional",
      description: "Práticas para equilibrio emocional e redução do stress"
    },
    {
      icon: Star,
      title: "Conteúdo Premium",
      description: "Acesso exclusivo a áudios e técnicas especializadas"
    },
    {
      icon: Users,
      title: "Comunidade Exclusiva",
      description: "Conecte-se com pessoas em jornada similar de crescimento"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transforme sua Mente,
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Transforme sua Vida
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Junte-se a milhares de pessoas que já descobriram o poder do desenvolvimento mental 
              através do <strong>Drive Mental</strong>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Formulário */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">Quero Fazer Parte!</CardTitle>
                <CardDescription>
                  Preencha seus dados e receba acesso exclusivo ao nosso conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      onFocus={() => handleFormFocus("name")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onFocus={() => handleFormFocus("email")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onFocus={() => handleFormFocus("phone")}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest">Área de Maior Interesse</Label>
                    <Select value={formData.interest_field} onValueChange={(value) => handleInputChange("interest_field", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione sua área de interesse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desenvolvimento_pessoal">Desenvolvimento Pessoal</SelectItem>
                        <SelectItem value="reducao_stress">Redução de Stress</SelectItem>
                        <SelectItem value="melhoria_foco">Melhoria do Foco</SelectItem>
                        <SelectItem value="autoestima">Autoestima</SelectItem>
                        <SelectItem value="relacionamentos">Relacionamentos</SelectItem>
                        <SelectItem value="carreira">Carreira</SelectItem>
                        <SelectItem value="sono_relaxamento">Sono e Relaxamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      "Processando..."
                    ) : (
                      <>
                        Quero Começar Agora
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao se inscrever, você concorda com nossos{" "}
                    <a href="/termos" className="text-primary hover:underline">
                      Termos de Serviço
                    </a>{" "}
                    e{" "}
                    <a href="/privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefícios */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Por que se inscrever?
                </h2>
                <div className="grid gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Depoimento */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4">
                    "O Drive Mental mudou completamente minha perspectiva. 
                    Os áudios são incríveis e realmente funcionam. Recomendo para todos!"
                  </blockquote>
                  <cite className="text-sm font-medium text-foreground">
                    — Maria Silva, Empresária
                  </cite>
                </CardContent>
              </Card>

              {/* Garantia */}
              <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                <div className="text-sm">
                  <strong className="text-success">100% Gratuito</strong>
                  <p className="text-muted-foreground">
                    Sem compromisso. Cancele quando quiser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};