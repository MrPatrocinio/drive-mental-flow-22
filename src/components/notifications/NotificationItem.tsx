import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/services/notificationService";

interface NotificationItemProps {
  notification: Notification;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertCircle;
    default:
      return Info;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-blue-500';
  }
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const Icon = getIcon(notification.type);

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "group flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-muted/50",
        !notification.read && "bg-muted/30"
      )}
      onClick={handleClick}
    >
      <Icon className={cn("h-4 w-4 mt-0.5", getIconColor(notification.type))} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <div className="flex items-center space-x-1">
            {!notification.read && (
              <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
};