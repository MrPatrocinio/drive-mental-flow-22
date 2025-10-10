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
  priority?: boolean; // true para carregar imediatamente (header), false para lazy loading
}

export const Logo = ({ 
  showText = false, 
  size = "md", 
  className = "",
  priority = false 
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

  const sizeMap = {
    sm: 128,
    md: 160,
    lg: 224
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imageError ? (
        <img 
          src="/lovable-uploads/30944d3c-0c99-44cc-aab1-2d9301e418a4.png"
          alt="Drive Mental Logo"
          className={`${sizeClasses[size]} object-contain`}
          style={{ imageRendering: 'crisp-edges' }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          width={sizeMap[size]}
          height={sizeMap[size]}
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