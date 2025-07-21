import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { notificationService, Notification } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => user ? notificationService.getUserNotifications(user.id) : Promise.resolve([]),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        // Update cache with new notification
        queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => 
          [newNotification, ...old]
        );

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: newNotification.type === 'error' ? 'destructive' : 'default',
        });
      }
    );

    return unsubscribe;
  }, [user, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => user ? notificationService.markAllAsRead(user.id) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};