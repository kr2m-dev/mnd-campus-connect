import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hook pour vérifier si l'utilisateur est admin
// Uses server-side is_admin function for secure role verification
export const useIsAdmin = () => {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Use the secure server-side is_admin function
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });

      if (error) {
        console.error("Error checking admin status:", error);
        // Fallback to profile check if RPC fails
        const { data: profile } = await supabase
          .from("profiles")
          .select("admin_role")
          .eq("user_id", user.id)
          .maybeSingle();
        return profile?.admin_role !== null && profile?.admin_role !== undefined;
      }
      
      return data === true;
    },
  });
};

// Hook pour récupérer tous les utilisateurs (admin)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour récupérer tous les fournisseurs (admin)
export const useAllSuppliers = () => {
  return useQuery({
    queryKey: ["all-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select(`
          *,
          products (count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour récupérer tous les produits (admin)
export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          suppliers (
            business_name
          ),
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false});

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour récupérer toutes les commandes (admin)
export const useAllOrders = () => {
  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url
            )
          ),
          suppliers (
            business_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour les statistiques admin
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Récupérer toutes les données en parallèle
      const [usersRes, suppliersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: false }),
        supabase.from("suppliers").select("*", { count: "exact", head: false }),
        supabase.from("products").select("*", { count: "exact", head: false }),
        supabase.from("orders").select("*", { count: "exact", head: false }),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (suppliersRes.error) throw suppliersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const users = usersRes.data || [];
      const suppliers = suppliersRes.data || [];
      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      // Calculs
      const totalUsers = users.length;
      const activeUsers = users.filter((u: any) => u.is_active).length;
      const bannedUsers = users.filter((u: any) => u.banned_at !== null).length;

      const totalSuppliers = suppliers.length;
      const verifiedSuppliers = suppliers.filter((s: any) => s.is_verified).length;

      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.is_active).length;

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order: any) =>
        sum + Number(order.total_amount), 0);

      // Inscriptions des 7 derniers jours
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const signupsByDay = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const daySignups = users.filter((user: any) => {
          const userDate = new Date(user.created_at);
          return userDate >= date && userDate < nextDay;
        }).length;

        return {
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          count: daySignups,
        };
      });

      // Commandes des 7 derniers jours
      const ordersByDay = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDay;
        });

        const revenue = dayOrders.reduce((sum, order: any) =>
          sum + Number(order.total_amount), 0);

        return {
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue,
        };
      });

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
        },
        suppliers: {
          total: totalSuppliers,
          verified: verifiedSuppliers,
          pending: totalSuppliers - verifiedSuppliers,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: totalProducts - activeProducts,
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue,
        },
        signupsByDay,
        ordersByDay,
      };
    },
  });
};

// Hook pour bannir/débannir un utilisateur (SECURE - uses RPC)
export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason, unban }: { userId: string; reason?: string; unban?: boolean }) => {
      // Use secure server-side RPC function instead of direct mutation
      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_reason: reason || null,
        should_unban: unban || false
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(variables.unban ? "Utilisateur débanni" : "Utilisateur banni");
    },
    onError: (error: any) => {
      const message = error.message || "Erreur lors de l'opération";
      toast.error(message);
    },
  });
};

// Hook pour activer/désactiver un utilisateur (SECURE - uses RPC)
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // Use secure server-side RPC function instead of direct mutation
      const { data, error } = await supabase.rpc('admin_toggle_user_active', {
        target_user_id: userId,
        new_is_active: isActive
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Statut utilisateur mis à jour");
    },
    onError: (error: any) => {
      const message = error.message || "Erreur lors de la mise à jour";
      toast.error(message);
    },
  });
};

// Hook pour vérifier un fournisseur (SECURE - uses RPC)
export const useVerifySupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, isVerified }: { supplierId: string; isVerified: boolean }) => {
      // Use secure server-side RPC function instead of direct mutation
      const { data, error } = await supabase.rpc('admin_verify_supplier', {
        target_supplier_id: supplierId,
        new_is_verified: isVerified
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Statut fournisseur mis à jour");
    },
    onError: (error: any) => {
      const message = error.message || "Erreur lors de la vérification";
      toast.error(message);
    },
  });
};

// Hook pour supprimer un produit (admin) (SECURE - uses RPC)
export const useDeleteProductAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Use secure server-side RPC function instead of direct mutation
      const { data, error } = await supabase.rpc('admin_delete_product', {
        target_product_id: productId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Produit supprimé");
    },
    onError: (error: any) => {
      const message = error.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });
};

// Hook pour activer/désactiver un produit (admin) (SECURE - uses RPC)
export const useToggleProductActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      // Use secure server-side RPC function instead of direct mutation
      const { data, error } = await supabase.rpc('admin_toggle_product_active', {
        target_product_id: productId,
        new_is_active: isActive
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Statut produit mis à jour");
    },
    onError: (error: any) => {
      const message = error.message || "Erreur lors de la mise à jour";
      toast.error(message);
    },
  });
};
