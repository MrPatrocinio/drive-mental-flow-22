
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ContentService, LandingPageContent, EditableField, EditableAudio } from '@/services/contentService';
import { SupabaseContentService } from '@/services/supabase/contentService';
import { FieldService } from '@/services/supabase/fieldService';
import { AudioService } from '@/services/supabase/audioService';
import { PricingService, PricingInfo, PricingInsert } from '@/services/supabase/pricingService';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { RealtimeService } from '@/services/realtimeService';
import type { AuthUser } from '@/services/supabase/authService';

interface AdminContextType {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  
  // Content state
  landingContent: LandingPageContent;
  fields: EditableField[];
  audios: EditableAudio[];
  pricing: PricingInfo | null;
  
  // Content actions
  updateLandingContent: (content: LandingPageContent) => Promise<void>;
  updateField: (field: EditableField) => Promise<void>;
  deleteField: (fieldId: string) => Promise<void>;
  updateAudio: (audio: EditableAudio) => Promise<void>;
  deleteAudio: (audioId: string) => Promise<void>;
  updatePricing: (pricing: PricingInsert) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // Use Supabase Auth for authentication
  const { user, isAuthenticated, isLoading, signOut } = useSupabaseAuth();
  
  // Content state
  const [landingContent, setLandingContent] = useState<LandingPageContent>(() => 
    ContentService.getLandingPageContent()
  );
  const [fields, setFields] = useState<EditableField[]>(() => 
    ContentService.getEditableFields()
  );
  const [audios, setAudios] = useState<EditableAudio[]>(() => 
    ContentService.getAudios()
  );
  const [pricing, setPricing] = useState<PricingInfo | null>(null);

  // Setup real-time updates
  useRealtimeUpdates({
    onFieldsChange: () => {
      console.log('AdminContext: Recebeu notificação de mudança nos fields');
      refreshData();
    },
    onAudiosChange: () => {
      console.log('AdminContext: Recebeu notificação de mudança nos audios');
      refreshData();
    },
    onLandingContentChange: () => {
      console.log('AdminContext: Recebeu notificação de mudança no landing content');
      refreshData();
    }
  });

  // Auth actions - delegate to Supabase
  const logout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error);
    }
  };

  // Content actions with real-time notifications
  const updateLandingContent = async (content: LandingPageContent) => {
    console.log('AdminContext: Salvando landing content', content);
    try {
      await SupabaseContentService.saveLandingPageContent(content);
      ContentService.saveLandingPageContent(content);
      setLandingContent(content);
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao salvar landing content:', error);
      throw error;
    }
  };

  const updateField = async (field: EditableField) => {
    console.log('AdminContext: Salvando field', field);
    try {
      if (field.id) {
        await FieldService.update(field.id, {
          title: field.title,
          icon_name: field.iconName,
          description: field.description || ''
        });
      }
      ContentService.saveField(field);
      await refreshData();
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao salvar field:', error);
      throw error;
    }
  };

  const deleteField = async (fieldId: string) => {
    console.log('AdminContext: Deletando field', fieldId);
    try {
      await FieldService.delete(fieldId);
      ContentService.deleteField(fieldId);
      await refreshData();
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao deletar field:', error);
      throw error;
    }
  };

  const updateAudio = async (audio: EditableAudio) => {
    console.log('AdminContext: Salvando audio', audio);
    try {
      if (audio.id) {
        await AudioService.update(audio.id, {
          title: audio.title,
          field_id: audio.fieldId,
          duration: audio.duration,
          tags: audio.tags || [],
          url: audio.url
        });
      }
      ContentService.saveAudio(audio);
      await refreshData();
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao salvar audio:', error);
      throw error;
    }
  };

  const deleteAudio = async (audioId: string) => {
    console.log('AdminContext: Deletando audio', audioId);
    try {
      await AudioService.delete(audioId);
      ContentService.deleteAudio(audioId);
      await refreshData();
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao deletar audio:', error);
      throw error;
    }
  };

  const updatePricing = async (pricingData: PricingInsert) => {
    console.log('AdminContext: Salvando pricing', pricingData);
    try {
      const savedPricing = await PricingService.save(pricingData);
      setPricing(savedPricing);
      // Force refresh for other components
      RealtimeService.forceRefresh();
    } catch (error) {
      console.error('AdminContext: Erro ao salvar pricing:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    console.log('AdminContext: Atualizando todos os dados');
    try {
      const [landingContentData, fieldsData, audiosData, pricingData] = await Promise.all([
        SupabaseContentService.getLandingPageContent(),
        FieldService.getAll(),
        AudioService.getAll(),
        PricingService.get()
      ]);

      // Update ContentService cache
      ContentService.saveLandingPageContent(landingContentData);
      
      // Convert Supabase fields to EditableFields
      const editableFields = fieldsData.map(field => ({
        id: field.id,
        title: field.title,
        iconName: field.icon_name,
        description: field.description || '',
        audioCount: field.audio_count,
        audios: []
      }));

      // Convert Supabase audios to EditableAudios
      const editableAudios = audiosData.map(audio => ({
        id: audio.id,
        title: audio.title,
        fieldId: audio.field_id,
        duration: audio.duration,
        url: audio.url,
        tags: audio.tags || [],
        description: ''
      }));

      setLandingContent(landingContentData);
      setFields(editableFields);
      setAudios(editableAudios);
      setPricing(pricingData);

      console.log('AdminContext: Dados atualizados com sucesso');
    } catch (error) {
      console.error('AdminContext: Erro ao atualizar dados:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    if (user?.role === 'admin') {
      refreshData();
    }
  }, [user]);

  const value: AdminContextType = {
    // Auth
    user,
    isAuthenticated: isAuthenticated && user?.role === 'admin',
    isLoading,
    logout,
    
    // Content
    landingContent,
    fields,
    audios,
    pricing,
    
    // Actions
    updateLandingContent,
    updateField,
    deleteField,
    updateAudio,
    deleteAudio,
    updatePricing,
    refreshData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
