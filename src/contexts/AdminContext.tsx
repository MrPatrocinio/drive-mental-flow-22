import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AuthService } from '@/services/authService';
import { ContentService, LandingPageContent, EditableField, EditableAudio } from '@/services/contentService';

interface AdminContextType {
  // Auth state
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
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
  // Auth state
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // Initialize auth state
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Auth actions
  const login = async (email: string, password: string) => {
    try {
      const adminUser = await AuthService.login({ email, password });
      setUser(adminUser);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
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
    isAuthenticated,
    login,
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