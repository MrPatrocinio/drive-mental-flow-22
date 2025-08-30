import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserWithSubscription } from "@/services/supabase/userManagementService";
import { Eye, Mail } from "lucide-react";

interface UserTableProps {
  users: UserWithSubscription[];
  loading: boolean;
  onViewUser?: (user: UserWithSubscription) => void;
  onContactUser?: (user: UserWithSubscription) => void;
}

/**
 * Tabela de usuários com informações de assinatura
 * Responsabilidade: Apresentação tabular dos dados de usuários
 */
export const UserTable = ({ users, loading, onViewUser, onContactUser }: UserTableProps) => {
  const getSubscriptionBadge = (subscribed: boolean | null, tier: string | null) => {
    if (!subscribed) {
      return <Badge variant="secondary">Gratuito</Badge>;
    }
    
    const variant = tier === "Premium" ? "default" : "outline";
    return <Badge variant={variant}>{tier || "Assinante"}</Badge>;
  };

  const getSubscriptionStatus = (subscribed: boolean | null, subscriptionEnd: string | null) => {
    if (!subscribed) return "Não assinante";
    
    if (!subscriptionEnd) return "Ativa";
    
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    
    if (endDate > now) {
      return `Expira em ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`;
    } else {
      return "Expirada";
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Assinatura</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {user.display_name || "Nome não informado"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.display_name?.includes('@') ? user.display_name : 'Email não disponível'}</TableCell>
              <TableCell>
                {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {getSubscriptionBadge(user.subscribed, user.subscription_tier)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {getSubscriptionStatus(user.subscribed, user.subscription_end)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewUser?.(user)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onContactUser?.(user)}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};