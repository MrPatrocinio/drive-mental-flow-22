import { Header } from "@/components/Header";
import { FieldCard } from "@/components/FieldCard";
import { FieldService } from "@/services/supabase/fieldService";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useEffect } from "react";
import { useDataSync } from "@/hooks/useDataSync";
import { PlaylistSection } from "@/components/playlist/PlaylistSection";
import * as Icons from "lucide-react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fields, setFields] = useState<Array<{
    id: string;
    title: string;
    description: string;
    audio_count: number;
    icon: any;
  }>>([]);
  const [loading, setLoading] = useState(true);
  
  const loadFields = useCallback(async () => {
    try {
      setLoading(true);
      const supabaseFields = await FieldService.getAll();
      setFields(supabaseFields.map(field => ({
        id: field.id,
        title: field.title,
        description: field.description || '',
        audio_count: field.audio_count,
        icon: (Icons as any)[field.icon_name] || Icons.Circle
      })));
    } catch (error) {
      console.error('Erro ao carregar campos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleSyncEvent = useCallback(() => {
    loadFields();
  }, [loadFields]);

  useDataSync({
    onFieldsChange: handleSyncEvent,
    onAudiosChange: handleSyncEvent
  });
  
  const filteredFields = fields.filter(field =>
    field.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header do Dashboard */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
              <p className="text-muted-foreground">Continue sua jornada de desenvolvimento</p>
            </div>
            <RefreshButton variant="ghost" size="sm" className="mt-2" />
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campos de desenvolvimento..."
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Campos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Seus <span className="text-premium">Campos</span> de Desenvolvimento
          </h2>
          
          {filteredFields.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FieldCard
                    title={field.title}
                    icon={field.icon}
                    audioCount={field.audio_count}
                    fieldId={field.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum campo encontrado para "{searchQuery}"
              </p>
              <Button 
                variant="ghost" 
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Limpar busca
              </Button>
            </div>
          )}
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="field-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {fields.reduce((total, field) => total + field.audio_count, 0)}
            </div>
            <p className="text-muted-foreground">Áudios Disponíveis</p>
          </div>
          
          <div className="field-card text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{fields.length}</div>
            <p className="text-muted-foreground">Campos de Desenvolvimento</p>
          </div>
          
          <div className="field-card text-center">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <p className="text-muted-foreground">Acesso Vitalício</p>
          </div>
        </div>

        {/* Playlists Section */}
        <PlaylistSection />
      </div>
    </div>
  );
}