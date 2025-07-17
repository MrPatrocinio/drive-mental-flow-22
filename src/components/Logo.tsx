/**
 * Logo Component - Componente reutilizável para exibir a logo
 * Responsabilidade: Apenas renderizar a logo com fallback
 * Princípio SRP: Apenas UI da logo
 * Princípio DRY: Componente reutilizável
 */

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { AssetService } from "@/services/assetService";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo = ({ 
  showText = false, 
  size = "md", 
  className = "" 
}: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "h-32 w-32",
    md: "h-40 w-40", 
    lg: "h-56 w-56"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imageError ? (
        <img 
          src="/lovable-uploads/30944d3c-0c99-44cc-aab1-2d9301e418a4.png"
          alt="Drive Mental Logo"
          className={`${sizeClasses[size]} object-contain`}
          style={{ imageRendering: 'crisp-edges' }}
          onError={handleImageError}
        />
      ) : (
        <Volume2 className={`${sizeClasses[size]} text-primary`} />
      )}
      
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold text-premium`}>
          Drive Mental
        </h1>
      )}
    </div>
  );
};