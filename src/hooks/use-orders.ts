import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  EnhancedOrder,
  EnhancedOrderItem,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrderStatus
} from "@/lib/database-types";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// ============================================
// ORDER QUERIES
// ============================================

/**
 * Get all orders for the current user with optimized joins
 * Uses indexed columns for better performance
 */
export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let query = supabase
        .from("orders")
        .select(`
          *,
          suppliers(business_name, contact_phone, contact_whatsapp)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Apply filters using indexed columns
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id);
      }

      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Manually fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", user.id)
        .single();

      // Add profile to each order
      const ordersWithProfile = data.map(order => ({
        ...order,
        profiles: profile
      }));

      return ordersWithProfile as EnhancedOrder[];
    },
  });
};

/**
 * Get orders for a supplier (supplier dashboard)
 * Uses indexed columns for optimal performance
 */
export const useSupplierOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: ["supplier-orders", filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Get supplier ID
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!supplier) throw new Error("Vous n'êtes pas fournisseur");

      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              price,
              image_url
            )
          )
        `)
        .eq("supplier_id", supplier.id)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get unique user IDs from orders
      const userIds = [...new Set(data.map(order => order.user_id))];

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, phone")
        .in("user_id", userIds);

      // Create a map of profiles by user_id
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Add profile to each order
      const ordersWithProfiles = data.map(order => ({
        ...order,
        profiles: profilesMap.get(order.user_id)
      }));

      return ordersWithProfiles as any[];
    },
  });
};

/**
 * Get a single order with its items
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          suppliers(business_name, contact_phone, contact_whatsapp)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", data.user_id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedOrder;
    },
    enabled: !!orderId,
  });
};

/**
 * Get order items for a specific order
 */
export const useOrderItems = (orderId: string) => {
  return useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      return data as EnhancedOrderItem[];
    },
    enabled: !!orderId,
  });
};

// ============================================
// ORDER MUTATIONS
// ============================================

/**
 * Create a new order
 * Updated_at will be set automatically by trigger
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");

      const { data, error } = await supabase
        .from("orders")
        .insert({ ...order, user_id: user.id })
        .select(`
          *,
          suppliers(business_name, contact_phone, contact_whatsapp)
        `)
        .single();

      if (error) throw error;

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", user.id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] });
      toast.success("Commande créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la commande");
    },
  });
};

/**
 * Update order status and details
 * Updated_at will be set automatically by trigger
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...order }: UpdateOrderInput) => {
      const { data, error } = await supabase
        .from("orders")
        .update(order)
        .eq("id", id)
        .select(`
          *,
          suppliers(business_name, contact_phone, contact_whatsapp)
        `)
        .single();

      if (error) throw error;

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", data.user_id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      toast.success("Commande mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
};

/**
 * Update only the order status (common operation)
 * No need to manually set updated_at - trigger handles it
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      // First, update the order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Then fetch the updated order with all relations
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          *,
          suppliers(business_name, contact_phone, contact_whatsapp)
        `)
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("user_id", data.user_id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      toast.success("Statut mis à jour");
    },
    onError: (error) => {
      logger.error("Error updating order status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });
};

/**
 * Cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: 'cancelled' as OrderStatus })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data as EnhancedOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      toast.success("Commande annulée");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation");
    },
  });
};

// ============================================
// ORDER STATISTICS
// ============================================

/**
 * Get order statistics for the current user
 */
export const useOrderStats = () => {
  return useQuery({
    queryKey: ["order-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("orders")
        .select("status, total_amount")
        .eq("user_id", user.id);

      if (error) throw error;

      const orders = data as EnhancedOrder[];

      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalAmount: orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total_amount, 0),
      };
    },
  });
};

/**
 * Get supplier order statistics
 */
export const useSupplierOrderStats = () => {
  return useQuery({
    queryKey: ["supplier-order-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Get supplier ID
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!supplier) throw new Error("Vous n'êtes pas fournisseur");

      const { data, error } = await supabase
        .from("orders")
        .select("status, total_amount")
        .eq("supplier_id", supplier.id);

      if (error) throw error;

      const orders = data as EnhancedOrder[];

      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + o.total_amount, 0),
      };
    },
  });
};
