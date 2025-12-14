import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = 'order' | 'message' | 'product' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Hook to get user's notifications
 */
export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!userId,
  });
};

/**
 * Hook to get unread notifications count
 */
export const useUnreadNotificationsCount = (userId?: string) => {
  return useQuery({
    queryKey: ["unread-notifications-count", userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count", data.userId] });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count", userId] });
      toast.success("Toutes les notifications marquées comme lues");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count", data.userId] });
      toast.success("Notification supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
};

/**
 * Hook to delete all read notifications
 */
export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .eq("is_read", true);

      if (error) throw error;
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      toast.success("Notifications lues supprimées");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
};

/**
 * Hook to create a notification (for system/admin use)
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {
      user_id: string;
      type: NotificationType;
      title: string;
      message: string;
      link?: string;
    }) => {
      const { error } = await supabase
        .from("notifications")
        .insert(notification);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count", variables.user_id] });
    },
  });
};
