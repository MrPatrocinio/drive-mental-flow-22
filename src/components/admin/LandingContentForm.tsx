import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { LandingPageContent } from '@/services/contentService';
import { Plus, X } from 'lucide-react';

export const LandingContentForm: React.FC = () => {
  const { landingContent, updateLandingContent } = useAdmin();
  const [content, setContent] = useState<LandingPageContent>(landingContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLandingContent(content);
  };

  const updateHero = (field: keyof typeof content.hero, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const updateFeature = (index: number, field: keyof typeof content.features[0], value: string) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      features: [
        ...prev.features,
        {
          id: `f${Date.now()}`,
          icon: 'Star',
          title: 'Nova Funcionalidade',
          description: 'Descrição da nova funcionalidade'
        }
      ]
    }));
  };

  const removeFeature = (index: number) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updatePricingBenefit = (index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        benefits: prev.pricing.benefits.map((benefit, i) => 
          i === index ? value : benefit
        )
      }
    }));
  };

  const addPricingBenefit = () => {
    setContent(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        benefits: [...prev.pricing.benefits, 'Novo benefício']
      }
    }));
  };

  const removePricingBenefit = (index: number) => {
    setContent(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        benefits: prev.pricing.benefits.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Seção Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-title">Título Principal (em branco)</Label>
            <Input
              id="hero-title"
              value={content.hero.title}
              onChange={(e) => updateHero('title', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="hero-title-highlight">Destaque do Título (em amarelo)</Label>
            <Input
              id="hero-title-highlight"
              value={content.hero.titleHighlight}
              onChange={(e) => updateHero('titleHighlight', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="hero-video">URL do Vídeo do YouTube (embed)</Label>
            <Input
              id="hero-video"
              value={content.hero.videoUrl || ''}
              onChange={(e) => updateHero('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
            />
          </div>
          
          <div>
            <Label htmlFor="hero-subtitle">Subtítulo</Label>
            <Textarea
              id="hero-subtitle"
              value={content.hero.subtitle}
              onChange={(e) => updateHero('subtitle', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero-cta">Texto do Botão Principal</Label>
              <Input
                id="hero-cta"
                value={content.hero.ctaText}
                onChange={(e) => updateHero('ctaText', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="hero-demo">Texto do Botão Demo</Label>
              <Input
                id="hero-demo"
                value={content.hero.demoText}
                onChange={(e) => updateHero('demoText', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Funcionalidades</CardTitle>
            <Button type="button" onClick={addFeature} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.features.map((feature, index) => (
            <div key={feature.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Funcionalidade {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ícone</Label>
                  <Input
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    placeholder="Nome do ícone Lucide"
                  />
                </div>
                
                <div>
                  <Label>Título</Label>
                  <Input
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preços e Benefícios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                value={content.pricing.price}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, price: Number(e.target.value) }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Input
                id="currency"
                value={content.pricing.currency}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  pricing: { ...prev.pricing, currency: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Benefícios</Label>
              <Button type="button" onClick={addPricingBenefit} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2">
              {content.pricing.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updatePricingBenefit(index, e.target.value)}
                    placeholder="Benefício"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricingBenefit(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rodapé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="footer-copyright">Copyright</Label>
            <Input
              id="footer-copyright"
              value={content.footer.copyright}
              onChange={(e) => setContent(prev => ({
                ...prev,
                footer: { ...prev.footer, copyright: e.target.value }
              }))}
            />
          </div>
          
          <div>
            <Label htmlFor="footer-lgpd-text">Texto sobre LGPD</Label>
            <Input
              id="footer-lgpd-text"
              value={content.footer.lgpdText}
              onChange={(e) => setContent(prev => ({
                ...prev,
                footer: { ...prev.footer, lgpdText: e.target.value }
              }))}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="footer-lgpd-link">Link LGPD</Label>
              <Input
                id="footer-lgpd-link"
                value={content.footer.lgpdLink}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  footer: { ...prev.footer, lgpdLink: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="footer-privacy-link">Link Política de Privacidade</Label>
              <Input
                id="footer-privacy-link"
                value={content.footer.privacyPolicyLink}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  footer: { ...prev.footer, privacyPolicyLink: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="footer-terms-link">Link Termos de Uso</Label>
              <Input
                id="footer-terms-link"
                value={content.footer.termsOfServiceLink}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  footer: { ...prev.footer, termsOfServiceLink: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="premium" size="lg">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};