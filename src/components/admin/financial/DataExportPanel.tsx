import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText, Database } from "lucide-react";

export interface DataExportPanelProps {
  onExport: (format: 'csv' | 'json') => Promise<void>;
  exporting?: boolean;
}

/**
 * Painel de exportação de dados financeiros
 * Responsabilidade: Interface para exportar relatórios
 */
export const DataExportPanel = ({ onExport, exporting }: DataExportPanelProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    await onExport(selectedFormat);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados Financeiros
        </CardTitle>
        <CardDescription>
          Baixe relatórios completos para análise externa ou contabilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="export-format">Formato de Exportação</Label>
          <Select value={selectedFormat} onValueChange={(value: 'csv' | 'json') => setSelectedFormat(value)}>
            <SelectTrigger id="export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV - Para Excel/Planilhas
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  JSON - Para Análise Técnica
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">O relatório incluirá:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Métricas financeiras principais (receita, ARPU, LTV)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Receita por período (últimos 12 meses)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Análise de churn e cancelamentos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              Estatísticas de assinantes ativos
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Gerando Relatório..." : `Exportar ${selectedFormat.toUpperCase()}`}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>CSV:</strong> Ideal para análise no Excel, Google Sheets ou importação em sistemas contábeis.</p>
          <p><strong>JSON:</strong> Formato técnico para integrações, análise programática ou backup de dados.</p>
        </div>
      </CardContent>
    </Card>
  );
};