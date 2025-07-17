import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ContentService, LandingPageContent, EditableField, EditableAudio } from '@/services/contentService';
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
  
  // Content actions
  updateLandingContent: (content: LandingPageContent) => void;
  updateField: (field: EditableField) => void;
  deleteField: (fieldId: string) => void;
  updateAudio: (audio: EditableAudio) => void;
  deleteAudio: (audioId: string) => void;
  refreshData: () => void;
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

  // Auth actions - delegate to Supabase
  const logout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error);
    }
  };

  // Content actions
  const updateLandingContent = (content: LandingPageContent) => {
    ContentService.saveLandingPageContent(content);
    setLandingContent(content);
  };

  const updateField = (field: EditableField) => {
    ContentService.saveField(field);
    refreshData();
  };

  const deleteField = (fieldId: string) => {
    ContentService.deleteField(fieldId);
    refreshData();
  };

  const updateAudio = (audio: EditableAudio) => {
    ContentService.saveAudio(audio);
    refreshData();
  };

  const deleteAudio = (audioId: string) => {
    ContentService.deleteAudio(audioId);
    refreshData();
  };

  const refreshData = () => {
    setLandingContent(ContentService.getLandingPageContent());
    setFields(ContentService.getEditableFields());
    setAudios(ContentService.getAudios());
  };

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
    
    // Actions
    updateLandingContent,
    updateField,
    deleteField,
    updateAudio,
    deleteAudio,
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