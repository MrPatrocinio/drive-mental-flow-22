
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FieldListNew } from '@/components/admin/FieldListNew';
import { useAdmin } from '@/contexts/AdminContext';

export const AdminFieldsPageNew: React.FC = () => {
  const { fields, updateField, deleteField } = useAdmin();

  const handleEdit = (field: any) => {
    // TODO: Implementar modal de edição
    console.log('Edit field:', field);
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
      </div>
    </AdminLayout>
  );
};

export default AdminFieldsPageNew;
