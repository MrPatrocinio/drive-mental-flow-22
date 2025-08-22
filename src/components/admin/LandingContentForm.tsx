
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Plus } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import type { LandingPageContent } from '@/services/supabase/contentService';

export const LandingContentForm = () => {
  const { landingContent, updateLandingContent } = useAdmin();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<LandingPageContent>(landingContent);

  useEffect(() => {
    setFormData(landingContent);
  }, [landingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateLandingContent(formData);
      toast({
        title: "Sucesso",
        description: "Conteúdo da landing page atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o conteúdo da landing page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeature = (index: number, field: keyof typeof formData.features[0], value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    const newFeature = {
      id: `feature-${Date.now()}`,
      icon: 'Brain',
      title: '',
      description: ''
    };
    setFormData({
      ...formData,
      features: [...formData.features, newFeature]
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Conteúdo da Landing Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seção Hero */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seção Principal (Hero)</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input
                    id="hero-title"
                    value={formData.hero.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, title: e.target.value }
                    })}
                    placeholder="Ex: Transforme sua mente e conquiste"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-title-highlight">Título Destacado</Label>
                  <Input
                    id="hero-title-highlight"
                    value={formData.hero.titleHighlight}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, titleHighlight: e.target.value }
                    })}
                    placeholder="Ex: seus objetivos mais ambiciosos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtítulo</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={formData.hero.subtitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, subtitle: e.target.value }
                    })}
                    placeholder="Descrição que explica o valor da plataforma"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-cta">Texto do Botão Principal</Label>
                    <Input
                      id="hero-cta"
                      value={formData.hero.ctaText}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, ctaText: e.target.value }
                      })}
                      placeholder="Ex: Começar Agora"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-demo">Texto do Botão Demo</Label>
                    <Input
                      id="hero-demo"
                      value={formData.hero.demoText}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, demoText: e.target.value }
                      })}
                      placeholder="Ex: Ver Demo"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Funcionalidades/Benefícios</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Funcionalidade
                </Button>
              </div>

              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <Card key={feature.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Funcionalidade {index + 1}</Label>
                        {formData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          placeholder="Nome do ícone (ex: Brain)"
                        />
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          placeholder="Título da funcionalidade"
                        />
                        <Input
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          placeholder="Descrição da funcionalidade"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rodapé</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-copyright">Copyright</Label>
                  <Input
                    id="footer-copyright"
                    value={formData.footer.copyright}
                    onChange={(e) => setFormData({
                      ...formData,
                      footer: { ...formData.footer, copyright: e.target.value }
                    })}
                    placeholder="© 2024 Drive Mental. Todos os direitos reservados."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-lgpd-text">Texto LGPD</Label>
                  <Input
                    id="footer-lgpd-text"
                    value={formData.footer.lgpdText}
                    onChange={(e) => setFormData({
                      ...formData,
                      footer: { ...formData.footer, lgpdText: e.target.value }
                    })}
                    placeholder="Este site está em conformidade com a LGPD"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-lgpd-link">Link LGPD</Label>
                    <Input
                      id="footer-lgpd-link"
                      value={formData.footer.lgpdLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, lgpdLink: e.target.value }
                      })}
                      placeholder="/lgpd"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-privacy-link">Link Política de Privacidade</Label>
                    <Input
                      id="footer-privacy-link"
                      value={formData.footer.privacyPolicyLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, privacyPolicyLink: e.target.value }
                      })}
                      placeholder="/privacy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-terms-link">Link Termos de Uso</Label>
                    <Input
                      id="footer-terms-link"
                      value={formData.footer.termsOfServiceLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        footer: { ...formData.footer, termsOfServiceLink: e.target.value }
                      })}
                      placeholder="/terms"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
