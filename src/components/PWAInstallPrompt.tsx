
/**
 * PWA Install Prompt Component - Prompt de instalação do PWA
 * Responsabilidade: Apenas UI do prompt de instalação
 * Princípio SRP: Apenas interface de instalação PWA
 */

import { useState } from "react";
import { Download, X, Smartphone, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePWA } from "@/hooks/usePWA";
import { ResponsiveService } from "@/services/responsiveService";

interface PWAInstallPromptProps {
  onClose?: () => void;
  showAsCard?: boolean;
  className?: string;
}

export const PWAInstallPrompt = ({ 
  onClose, 
  showAsCard = true, 
  className = "" 
}: PWAInstallPromptProps) => {
  const { 
    isInstallable, 
    isInstalled, 
    platform, 
    isInstalling, 
    installApp, 
    iosInstructions 
  } = usePWA();
  
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    if (platform === 'ios') {
      // Para iOS, apenas mostra as instruções
      return;
    }
    
    const success = await installApp();
    if (success) {
      setDismissed(true);
      onClose?.();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  const renderIOSInstructions = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Share className="h-4 w-4" />
        <span className="font-medium">Como instalar no iPhone/iPad:</span>
      </div>
      <ol className="space-y-2 text-sm text-muted-foreground">
        {iosInstructions.map((instruction, index) => (
          <li key={index} className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5 min-w-[24px] h-6 flex items-center justify-center">
              {index + 1}
            </Badge>
            <span>{instruction}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-3">
      <Button 
        onClick={handleInstall}
        disabled={isInstalling}
        className={`w-full ${ResponsiveService.getButtonClasses(true)}`}
      >
        <Download className="h-4 w-4 mr-2" />
        {isInstalling ? 'Instalando...' : 'Instalar App'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Tenha acesso rápido sem ocupar espaço no seu dispositivo
      </p>
    </div>
  );

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className={`font-semibold ${ResponsiveService.getTextClasses('md')}`}>
              Instale o Drive Mental
            </h3>
            <p className={`text-muted-foreground ${ResponsiveService.getTextClasses('sm')}`}>
              Acesso rápido na tela inicial
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDismiss}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4">
        {platform === 'ios' ? renderIOSInstructions() : renderAndroidInstructions()}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Plus className="h-3 w-3" />
        <span>Funciona offline • Atualizações automáticas • Experiência nativa</span>
      </div>
    </>
  );

  if (!showAsCard) {
    return (
      <div className={`p-4 bg-card border rounded-lg ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Card className={`${ResponsiveService.getCardClasses()} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Instalar App
        </CardTitle>
        <CardDescription>
          Tenha o Drive Mental sempre à mão
        </CardDescription>
      </CardHeader>
      <CardContent>
        {platform === 'ios' ? renderIOSInstructions() : renderAndroidInstructions()}
      </CardContent>
    </Card>
  );
};
