import { Header } from "@/components/Header";
import { FieldCard } from "@/components/FieldCard";
import { FieldService } from "@/services/supabase/fieldService";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/RefreshButton";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { Search, User, Play, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDataSync } from "@/hooks/useDataSync";
import { PlaylistSection } from "@/components/playlist/PlaylistSection";
import { SearchService, SearchResult } from "@/services/searchService";
import * as Icons from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

  // Busca unificada com debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);
      
      SearchService.searchWithDebounce(value, (results) => {
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setIsSearching(false);
      SearchService.cancelSearch();
    }
  }, []);

  // Navegação para resultados
  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.type === 'field') {
      navigate(`/campo/${result.id}`);
    } else if (result.type === 'audio' && result.field_id) {
      navigate(`/campo/${result.field_id}?audio=${result.id}`);
    }
    setShowSearchResults(false);
    setSearchQuery("");
  }, [navigate]);

  // Fechar dropdown com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const filteredFields = searchQuery.trim().length >= 2 && !showSearchResults 
    ? [] 
    : fields.filter(field =>
        searchQuery.length < 2 || 
        field.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const groupedResults = SearchService.groupResultsByType(searchResults);

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Banner de Boas-Vindas para Novos Assinantes */}
        <WelcomeMessage />

        {/* Header do Dashboard */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Continue sua jornada de desenvolvimento</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <RefreshButton variant="ghost" size="sm" />
              <PWAInstallButton variant="ghost" size="sm" />
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="max-w-md mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campos ou áudios..."
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Dropdown de Resultados */}
          {showSearchResults && (
            <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-lg">
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Buscando...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {/* Campos */}
                    {groupedResults.fields.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Campos
                        </div>
                        {groupedResults.fields.map((result) => (
                          <button
                            key={`field-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FolderOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{result.title}</div>
                              {result.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">Campo</Badge>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Áudios */}
                    {groupedResults.audios.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Áudios
                        </div>
                        {groupedResults.audios.map((result) => (
                          <button
                            key={`audio-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <Play className="h-4 w-4 text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{result.title}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">Áudio</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhum resultado encontrado para "{searchQuery}"
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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