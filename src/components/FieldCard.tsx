import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FieldCardProps {
  title: string;
  icon: LucideIcon;
  audioCount: number;
  fieldId: string;
}

export const FieldCard = ({ title, icon: Icon, audioCount, fieldId }: FieldCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="field-card group cursor-pointer" onClick={() => navigate(`/campo/${fieldId}`)}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 smooth-transition">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{audioCount}</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {audioCount} áudio{audioCount !== 1 ? 's' : ''} disponível{audioCount !== 1 ? 'is' : ''}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 smooth-transition"
        >
          Explorar
        </Button>
      </div>
    </div>
  );
};