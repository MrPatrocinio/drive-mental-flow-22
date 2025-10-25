import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useGuarantee, GuaranteeStatus } from "@/hooks/useGuarantee";
import { GuaranteeKPICards } from "@/components/admin/guarantee/GuaranteeKPICards";
import { GuaranteeFilters } from "@/components/admin/guarantee/GuaranteeFilters";
import { GuaranteeTable } from "@/components/admin/guarantee/GuaranteeTable";
import { GuaranteeDetailsDrawer } from "@/components/admin/guarantee/GuaranteeDetailsDrawer";

const AdminGuaranteePage = () => {
  const [search, setSearch] = useState("");
  const [selectedGuarantee, setSelectedGuarantee] = useState<GuaranteeStatus | null>(null);
  const { 
    guarantees, 
    loading, 
    filter, 
    setFilter,
    processRefund,
    denyGuarantee
  } = useGuarantee();

  const filteredGuarantees = guarantees.filter(g => 
    g.user_id.toLowerCase().includes(search.toLowerCase()) ||
    g.purchase_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Garantia">
      <div className="space-y-6">
        {/* Header com busca */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por User ID ou Purchase ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <GuaranteeKPICards guarantees={guarantees} />

        {/* Filtros */}
        <GuaranteeFilters 
          currentFilter={filter} 
          onFilterChange={setFilter} 
        />

        {/* Tabela */}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregando garantias...
          </div>
        ) : (
          <GuaranteeTable 
            guarantees={filteredGuarantees}
            onViewDetails={setSelectedGuarantee}
          />
        )}

        {/* Drawer de detalhes */}
        <GuaranteeDetailsDrawer
          guarantee={selectedGuarantee}
          open={!!selectedGuarantee}
          onClose={() => setSelectedGuarantee(null)}
          onRefund={processRefund}
          onDeny={denyGuarantee}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminGuaranteePage;
