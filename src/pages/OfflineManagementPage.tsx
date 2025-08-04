/**
 * Página de gerenciamento de áudios offline
 * Segue o princípio SRP: apenas UI da página de gerenciamento
 */

import { Header } from "@/components/Header";
import { OfflineManagementPanel } from "@/components/OfflineManagementPanel";

export default function OfflineManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton title="Gerenciar Downloads" />
      
      <main className="container mx-auto px-4 py-6">
        <OfflineManagementPanel />
      </main>
    </div>
  );
}