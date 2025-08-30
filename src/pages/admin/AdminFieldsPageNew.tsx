
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FieldListNew } from '@/components/admin/FieldListNew';
import { FieldEditModal } from '@/components/admin/FieldEditModal';
import { useAdmin } from '@/contexts/AdminContext';
import { Field } from '@/services/supabase/fieldService';

export const AdminFieldsPageNew: React.FC = () => {
  const { fields, updateField, deleteField } = useAdmin();
  
  // Estado do modal (seguindo SRP - gerenciar apenas o estado da UI)
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const handleSaveField = async (updatedField: Field) => {
    await updateField(updatedField);
    handleCloseModal();
  };

  const handleDelete = async (fieldId: string) => {
    try {
      await deleteField(fieldId);
    } catch (error) {
      console.error('Erro ao deletar campo:', error);
    }
  };

  return (
    <AdminLayout title="Gerenciar Campos">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Campos de Desenvolvimento</h2>
          <p className="text-muted-foreground">
            Gerencie os campos disponíveis na plataforma
          </p>
        </div>
        
        <FieldListNew 
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        
        {/* Modal de Edição */}
        <FieldEditModal
          field={editingField}
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveField}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminFieldsPageNew;
