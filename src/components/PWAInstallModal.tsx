/**
 * PWA Install Modal - Modal com instruções de instalação por plataforma
 * Responsabilidade: Apenas UI do modal de instruções PWA
 * Princípio SRP: Apenas modal de instruções PWA
 */

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Smartphone, 
  Monitor, 
  Share, 
  MoreVertical, 
  Plus,
  ChevronRight,
  ChevronDown,
  Home,
  X
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { PWAPreferencesService } from "@/services/pwaPreferencesService";

interface PWAInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export const PWAInstallModal = ({ open, onClose }: PWAInstallModalProps) => {
  const { platform } = usePWA();
  const [expandedSection, setExpandedSection] = useState<string>(() => {
    // Auto-expande seção relevante baseada na plataforma
    return platform === 'ios' ? 'ios' : 
           platform === 'android' ? 'android' : 
           platform === 'desktop' ? 'desktop' : 'android';
  });

  const handleDismissForever = () => {
    PWAPreferencesService.setDismissed();
    onClose();
  };

  const sections = [
    {
      id: 'ios',
      title: 'iPhone / iPad (Safari)',
      icon: <Smartphone className="h-5 w-5" />,
      badge: platform === 'ios' ? 'Sua plataforma' : null,
      steps: [
        { icon: <Smartphone className="h-4 w-4" />, text: 'Abra pelo Safari' },
        { icon: <Share className="h-4 w-4" />, text: 'Toque no botão Compartilhar (ícone de quadrado com seta para cima)' },
        { icon: <Plus className="h-4 w-4" />, text: 'Role a lista e toque em "Adicionar à Tela de Início"' },
        { icon: <Plus className="h-4 w-4" />, text: 'Toque em "Adicionar"' },
        { icon: <Home className="h-4 w-4" />, text: 'Procure o ícone Drive Mental na tela inicial e abra por ele' }
      ]
    },
    {
      id: 'android',
      title: 'Android (Chrome, Edge, Brave)',
      icon: <Smartphone className="h-5 w-5" />,
      badge: platform === 'android' ? 'Sua plataforma' : null,
      steps: [
        { icon: <MoreVertical className="h-4 w-4" />, text: 'Toque no menu ⋮ no canto superior direito' },
        { icon: <Plus className="h-4 w-4" />, text: 'Toque em "Instalar app" ou "Adicionar à tela inicial"' },
        { icon: <Plus className="h-4 w-4" />, text: 'Confirme "Instalar/Adicionar"' },
        { icon: <Home className="h-4 w-4" />, text: 'Abra pelo ícone Drive Mental que aparecerá na tela inicial' }
      ]
    },
    {
      id: 'desktop',
      title: 'Desktop (Chrome / Edge)',
      icon: <Monitor className="h-5 w-5" />,
      badge: platform === 'desktop' ? 'Sua plataforma' : null,
      steps: [
        { icon: <Plus className="h-4 w-4" />, text: 'Na barra de endereço, clique no ícone de instalar (monitor com seta/"+")' },
        { icon: <Plus className="h-4 w-4" />, text: 'Clique em "Instalar Drive Mental"' },
        { icon: <Home className="h-4 w-4" />, text: 'Um atalho será criado no sistema; abra por ele para usar em janela própria' }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Instalar o Drive Mental na tela inicial
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            Tenha acesso rápido como se fosse um app nativo
          </p>
        </DialogHeader>

        <div className="space-y-2">
          {sections.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSection === section.id}
              onOpenChange={(isOpen) => setExpandedSection(isOpen ? section.id : '')}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-2">
                  {section.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{step.text}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDismissForever}
            className="w-full sm:w-auto text-muted-foreground"
          >
            Não mostrar novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};