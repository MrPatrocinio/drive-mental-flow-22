import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import type { LandingPageContent } from '@/services/landingContentService';
export const LandingContentForm = () => {
  const {
    landingContent,
    updateLandingContent
  } = useAdmin();
  const {
    toast
  } = useToast();
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
        description: "Conteúdo da landing page atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o conteúdo da landing page",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const updateFeature = (index: number, field: keyof typeof formData.features[0], value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    setFormData({
      ...formData,
      features: newFeatures
    });
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
    setFormData({
      ...formData,
      features: newFeatures
    });
  };
  const updateBenefit = (index: number, field: string, value: string) => {
    const newBenefits = [...formData.whatIsDriveMental.benefits];
    newBenefits[index] = {
      ...newBenefits[index],
      [field]: value
    };
    setFormData({
      ...formData,
      whatIsDriveMental: {
        ...formData.whatIsDriveMental,
        benefits: newBenefits
      }
    });
  };
  const addBenefit = () => {
    const newBenefit = {
      id: `benefit-${Date.now()}`,
      icon: 'Brain',
      title: '',
      description: ''
    };
    setFormData({
      ...formData,
      whatIsDriveMental: {
        ...formData.whatIsDriveMental,
        benefits: [...formData.whatIsDriveMental.benefits, newBenefit]
      }
    });
  };
  const removeBenefit = (index: number) => {
    const newBenefits = formData.whatIsDriveMental.benefits.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      whatIsDriveMental: {
        ...formData.whatIsDriveMental,
        benefits: newBenefits
      }
    });
  };
  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      icon: 'Target',
      title: '',
      description: ''
    };
    setFormData({
      ...formData,
      comoFunciona: {
        ...formData.comoFunciona,
        steps: [...formData.comoFunciona.steps, newStep]
      }
    });
  };
  const removeStep = (index: number) => {
    const newSteps = formData.comoFunciona.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      comoFunciona: {
        ...formData.comoFunciona,
        steps: newSteps
      }
    });
  };
  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...formData.comoFunciona.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData({
      ...formData,
      comoFunciona: {
        ...formData.comoFunciona,
        steps: newSteps
      }
    });
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Conteúdo da Landing Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seção Hero */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seção 1 — Hero</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input id="hero-title" value={formData.hero.title} onChange={e => setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    title: e.target.value
                  }
                })} placeholder="Ex: Transforme sua mente e conquiste" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-title-highlight">Título Destacado</Label>
                  <Input id="hero-title-highlight" value={formData.hero.titleHighlight} onChange={e => setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    titleHighlight: e.target.value
                  }
                })} placeholder="Ex: seus objetivos mais ambiciosos" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Subtítulo</Label>
                  <Textarea id="hero-subtitle" value={formData.hero.subtitle} onChange={e => setFormData({
                  ...formData,
                  hero: {
                    ...formData.hero,
                    subtitle: e.target.value
                  }
                })} placeholder="Descrição que explica o valor da plataforma" rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-cta">Texto do Botão Principal</Label>
                    <Input id="hero-cta" value={formData.hero.ctaText} onChange={e => setFormData({
                    ...formData,
                    hero: {
                      ...formData.hero,
                      ctaText: e.target.value
                    }
                  })} placeholder="Ex: Começar Agora" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-demo">Texto do Botão Demo</Label>
                    <Input id="hero-demo" value={formData.hero.demoText} onChange={e => setFormData({
                    ...formData,
                    hero: {
                      ...formData.hero,
                      demoText: e.target.value
                    }
                  })} placeholder="Ex: Ver Demo" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção "O que é o Drive Mental" */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seção 2 — O que é o Drive Mental</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="whatIsDriveMental-enabled" className="text-sm">Ativar Seção</Label>
                  <Switch id="whatIsDriveMental-enabled" checked={formData.whatIsDriveMental.enabled} onCheckedChange={checked => setFormData({
                  ...formData,
                  whatIsDriveMental: {
                    ...formData.whatIsDriveMental,
                    enabled: checked
                  }
                })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatIsDriveMental-title">Título da Seção</Label>
                <Input id="whatIsDriveMental-title" value={formData.whatIsDriveMental.title} onChange={e => setFormData({
                ...formData,
                whatIsDriveMental: {
                  ...formData.whatIsDriveMental,
                  title: e.target.value
                }
              })} placeholder="Ex: 🧬 O que é o Drive Mental" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatIsDriveMental-subtitle">Texto Introdutório (aceita HTML com ** para negrito)</Label>
                <Textarea id="whatIsDriveMental-subtitle" rows={4} value={formData.whatIsDriveMental.subtitle} onChange={e => setFormData({
                ...formData,
                whatIsDriveMental: {
                  ...formData.whatIsDriveMental,
                  subtitle: e.target.value
                }
              })} placeholder="O **Drive Mental** é um **aplicativo web de reprogramação mental**..." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Benefícios</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Benefício
                  </Button>
                </div>

                {formData.whatIsDriveMental.benefits.map((benefit, index) => <Card key={benefit.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Benefício {index + 1}</Label>
                        {formData.whatIsDriveMental.benefits.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeBenefit(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input value={benefit.icon} onChange={e => updateBenefit(index, 'icon', e.target.value)} placeholder="Ícone (ex: RefreshCw)" />
                        <Input value={benefit.title} onChange={e => updateBenefit(index, 'title', e.target.value)} placeholder="Título do benefício" />
                        <Input value={benefit.description} onChange={e => updateBenefit(index, 'description', e.target.value)} placeholder="Descrição" />
                      </div>
                    </div>
                  </Card>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatIsDriveMental-scientificNote">Nota Científica Final (aceita HTML)</Label>
                <Textarea id="whatIsDriveMental-scientificNote" rows={3} value={formData.whatIsDriveMental.scientificNote} onChange={e => setFormData({
                ...formData,
                whatIsDriveMental: {
                  ...formData.whatIsDriveMental,
                  scientificNote: e.target.value
                }
              })} placeholder="🧠 <em>Tudo com base em estudos...</em>" />
              </div>
            </div>

            <Separator />

            {/* Seção "Como Funciona" */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seção 3 — Como Funciona</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="comoFunciona-enabled" className="text-sm">Ativar Seção</Label>
                  <Switch id="comoFunciona-enabled" checked={formData.comoFunciona.enabled} onCheckedChange={checked => setFormData({
                  ...formData,
                  comoFunciona: {
                    ...formData.comoFunciona,
                    enabled: checked
                  }
                })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comoFunciona-title">Título da Seção</Label>
                <Input id="comoFunciona-title" value={formData.comoFunciona.title} onChange={e => setFormData({
                ...formData,
                comoFunciona: {
                  ...formData.comoFunciona,
                  title: e.target.value
                }
              })} placeholder="Ex: 🔬 Como Funciona" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comoFunciona-subtitle">Texto Introdutório (aceita HTML)</Label>
                <Textarea id="comoFunciona-subtitle" rows={3} value={formData.comoFunciona.subtitle} onChange={e => setFormData({
                ...formData,
                comoFunciona: {
                  ...formData.comoFunciona,
                  subtitle: e.target.value
                }
              })} placeholder="Siga o passo a passo simples..." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Etapas do Processo</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Etapa
                  </Button>
                </div>

                {formData.comoFunciona.steps.map((step, index) => <Card key={step.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Etapa {index + 1}
                        </Label>
                        {formData.comoFunciona.steps.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeStep(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input value={step.icon} onChange={e => updateStep(index, 'icon', e.target.value)} placeholder="Ícone (ex: Target)" />
                        <Input value={step.title} onChange={e => updateStep(index, 'title', e.target.value)} placeholder="Título da etapa" />
                        <Input value={step.description} onChange={e => updateStep(index, 'description', e.target.value)} placeholder="Descrição" />
                      </div>
                    </div>
                  </Card>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comoFunciona-finalNote">Parágrafo Final Motivacional (aceita HTML)</Label>
                <Textarea id="comoFunciona-finalNote" rows={3} value={formData.comoFunciona.finalNote} onChange={e => setFormData({
                ...formData,
                comoFunciona: {
                  ...formData.comoFunciona,
                  finalNote: e.target.value
                }
              })} placeholder="🕒 Em apenas 21 dias..." />
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seção 4 — Por que o Drive Mental funciona</h3>
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Funcionalidade
                </Button>
              </div>

              <div className="space-y-4">
                {formData.features.map((feature, index) => <Card key={feature.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Funcionalidade {index + 1}</Label>
                        {formData.features.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input value={feature.icon} onChange={e => updateFeature(index, 'icon', e.target.value)} placeholder="Nome do ícone (ex: Brain)" />
                        <Input value={feature.title} onChange={e => updateFeature(index, 'title', e.target.value)} placeholder="Título da funcionalidade" />
                        <Input value={feature.description} onChange={e => updateFeature(index, 'description', e.target.value)} placeholder="Descrição da funcionalidade" />
                      </div>
                    </div>
                  </Card>)}
              </div>
            </div>

            <Separator />

            {/* Seção 7 — Ancoragem de Valor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seção 7 — Ancoragem de Valor (Comparação de Preços)</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="priceComparison-enabled" className="text-sm">Ativar Seção</Label>
                  <Switch 
                    id="priceComparison-enabled" 
                    checked={formData.priceComparison?.enabled ?? true}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      priceComparison: {
                        ...formData.priceComparison,
                        enabled: checked
                      }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceComparison-title">Título da Seção</Label>
                <Input 
                  id="priceComparison-title" 
                  value={formData.priceComparison?.title ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    priceComparison: {
                      ...formData.priceComparison,
                      title: e.target.value
                    }
                  })}
                  placeholder="Ex: O valor de uma mente saudável não precisa custar tão caro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceComparison-subtitle">Subtítulo</Label>
                <Textarea 
                  id="priceComparison-subtitle" 
                  rows={2}
                  value={formData.priceComparison?.subtitle ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    priceComparison: {
                      ...formData.priceComparison,
                      subtitle: e.target.value
                    }
                  })}
                  placeholder="Veja a comparação real entre os valores..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Opções de Comparação</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const newOption = {
                        id: `option-${Date.now()}`,
                        icon: 'Users',
                        title: '',
                        frequency: '',
                        pricePerYear: '',
                        isHighlight: false
                      };
                      setFormData({
                        ...formData,
                        priceComparison: {
                          ...formData.priceComparison,
                          options: [...(formData.priceComparison?.options ?? []), newOption]
                        }
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Opção
                  </Button>
                </div>

                {(formData.priceComparison?.options ?? []).map((option, index) => (
                  <Card key={option.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Opção {index + 1}</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`option-highlight-${index}`} className="text-xs">Destacar?</Label>
                            <Switch 
                              id={`option-highlight-${index}`}
                              checked={option.isHighlight}
                              onCheckedChange={(checked) => {
                                const newOptions = [...(formData.priceComparison?.options ?? [])];
                                newOptions[index] = { ...newOptions[index], isHighlight: checked };
                                setFormData({
                                  ...formData,
                                  priceComparison: {
                                    ...formData.priceComparison,
                                    options: newOptions
                                  }
                                });
                              }}
                            />
                          </div>
                          {(formData.priceComparison?.options ?? []).length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const newOptions = (formData.priceComparison?.options ?? []).filter((_, i) => i !== index);
                                setFormData({
                                  ...formData,
                                  priceComparison: {
                                    ...formData.priceComparison,
                                    options: newOptions
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input 
                          value={option.icon}
                          onChange={(e) => {
                            const newOptions = [...(formData.priceComparison?.options ?? [])];
                            newOptions[index] = { ...newOptions[index], icon: e.target.value };
                            setFormData({
                              ...formData,
                              priceComparison: {
                                ...formData.priceComparison,
                                options: newOptions
                              }
                            });
                          }}
                          placeholder="Ícone (ex: Users, Award, Sparkles)"
                        />
                        <Input 
                          value={option.title}
                          onChange={(e) => {
                            const newOptions = [...(formData.priceComparison?.options ?? [])];
                            newOptions[index] = { ...newOptions[index], title: e.target.value };
                            setFormData({
                              ...formData,
                              priceComparison: {
                                ...formData.priceComparison,
                                options: newOptions
                              }
                            });
                          }}
                          placeholder="Título (ex: Psicólogo Iniciante)"
                        />
                        <Input 
                          value={option.frequency}
                          onChange={(e) => {
                            const newOptions = [...(formData.priceComparison?.options ?? [])];
                            newOptions[index] = { ...newOptions[index], frequency: e.target.value };
                            setFormData({
                              ...formData,
                              priceComparison: {
                                ...formData.priceComparison,
                                options: newOptions
                              }
                            });
                          }}
                          placeholder="Frequência (ex: 1x por semana)"
                        />
                        <Input 
                          value={option.pricePerYear}
                          onChange={(e) => {
                            const newOptions = [...(formData.priceComparison?.options ?? [])];
                            newOptions[index] = { ...newOptions[index], pricePerYear: e.target.value };
                            setFormData({
                              ...formData,
                              priceComparison: {
                                ...formData.priceComparison,
                                options: newOptions
                              }
                            });
                          }}
                          placeholder="Preço Anual (ex: R$ 7.200,00/ano)"
                        />
                        <Input 
                          value={option.badge ?? ''}
                          onChange={(e) => {
                            const newOptions = [...(formData.priceComparison?.options ?? [])];
                            newOptions[index] = { ...newOptions[index], badge: e.target.value || undefined };
                            setFormData({
                              ...formData,
                              priceComparison: {
                                ...formData.priceComparison,
                                options: newOptions
                              }
                            });
                          }}
                          placeholder="Badge (opcional, ex: Plano Anual)"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceComparison-impactText">Texto de Impacto (aceita HTML)</Label>
                <Textarea 
                  id="priceComparison-impactText" 
                  rows={3}
                  value={formData.priceComparison?.impactText ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    priceComparison: {
                      ...formData.priceComparison,
                      impactText: e.target.value
                    }
                  })}
                  placeholder='Pelo preço de apenas <span class="text-premium">1 sessão...</span>'
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceComparison-ctaText">Texto do Botão CTA</Label>
                  <Input 
                    id="priceComparison-ctaText" 
                    value={formData.priceComparison?.ctaButton?.text ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceComparison: {
                        ...formData.priceComparison,
                        ctaButton: {
                          ...formData.priceComparison?.ctaButton,
                          text: e.target.value
                        }
                      }
                    })}
                    placeholder="Ex: EU QUERO!!!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceComparison-scrollTarget">ID da Seção de Destino (scroll)</Label>
                  <Input 
                    id="priceComparison-scrollTarget" 
                    value={formData.priceComparison?.ctaButton?.scrollToSection ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceComparison: {
                        ...formData.priceComparison,
                        ctaButton: {
                          ...formData.priceComparison?.ctaButton,
                          scrollToSection: e.target.value
                        }
                      }
                    })}
                    placeholder="Ex: subscription-plans"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rodapé</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer-copyright">Copyright</Label>
                  <Input id="footer-copyright" value={formData.footer.copyright} onChange={e => setFormData({
                  ...formData,
                  footer: {
                    ...formData.footer,
                    copyright: e.target.value
                  }
                })} placeholder="© 2024 Drive Mental. Todos os direitos reservados." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-lgpd-text">Texto LGPD</Label>
                  <Input id="footer-lgpd-text" value={formData.footer.lgpdText} onChange={e => setFormData({
                  ...formData,
                  footer: {
                    ...formData.footer,
                    lgpdText: e.target.value
                  }
                })} placeholder="Este site está em conformidade com a LGPD" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-lgpd-link">Link LGPD</Label>
                    <Input id="footer-lgpd-link" value={formData.footer.lgpdLink} onChange={e => setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      lgpdLink: e.target.value
                    }
                  })} placeholder="/lgpd" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-privacy-link">Link Política de Privacidade</Label>
                    <Input id="footer-privacy-link" value={formData.footer.privacyPolicyLink} onChange={e => setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      privacyPolicyLink: e.target.value
                    }
                  })} placeholder="/privacy" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-terms-link">Link Termos de Uso</Label>
                    <Input id="footer-terms-link" value={formData.footer.termsOfServiceLink} onChange={e => setFormData({
                    ...formData,
                    footer: {
                      ...formData.footer,
                      termsOfServiceLink: e.target.value
                    }
                  })} placeholder="/terms" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>;
};