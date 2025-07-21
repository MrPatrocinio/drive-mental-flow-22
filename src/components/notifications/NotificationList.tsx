import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { CheckCheck } from "lucide-react";

export const NotificationList = () => {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Nenhuma notificação
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-semibold">Notificações</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-8 px-2 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Marcar todas
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-80">
        <div className="p-2">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};