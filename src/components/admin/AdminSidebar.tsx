import { NavLink } from "react-router-dom";
import { Home, FileText, Music, Users, DollarSign, BarChart3, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Conteúdo da Landing",
    href: "/admin/landing",
    icon: FileText,
  },
  {
    label: "Preços",
    href: "/admin/pricing",
    icon: DollarSign,
  },
  {
    label: "Campos",
    href: "/admin/fields",
    icon: Users,
  },
  {
    label: "Áudios",
    href: "/admin/audios",
    icon: Music,
  },
  {
    label: "Música de Fundo",
    href: "/admin/background-music",
    icon: Music,
  },
  {
    label: "Estatísticas",
    href: "/admin/stats",
    icon: BarChart3,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
  {
    label: "Validação",
    href: "/admin/validation",
    icon: Shield,
  }
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium smooth-transition",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};