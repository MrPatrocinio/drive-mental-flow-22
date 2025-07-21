import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

class NotificationService {
  async createNotification(userId: string, notificationData: CreateNotificationData): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          data: notificationData.data || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Predefined notification templates
  async notifySubscriptionSuccess(userId: string, tier: string) {
    return this.createNotification(userId, {
      title: 'Assinatura Ativada!',
      message: `Sua assinatura ${tier} foi ativada com sucesso.`,
      type: 'success',
      data: { tier, action: 'subscription_activated' }
    });
  }

  async notifySubscriptionExpiring(userId: string, daysLeft: number) {
    return this.createNotification(userId, {
      title: 'Assinatura Expirando',
      message: `Sua assinatura expira em ${daysLeft} dias. Renove para continuar aproveitando todos os benefícios.`,
      type: 'warning',
      data: { daysLeft, action: 'subscription_expiring' }
    });
  }

  async notifyNewAudio(userId: string, audioTitle: string, fieldTitle: string) {
    return this.createNotification(userId, {
      title: 'Novo Áudio Disponível',
      message: `"${audioTitle}" foi adicionado ao campo ${fieldTitle}.`,
      type: 'info',
      data: { audioTitle, fieldTitle, action: 'new_audio' }
    });
  }
}

export const notificationService = new NotificationService();