import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url?: string;
    rating: number;
    suppliers?: {
      business_name: string;
    };
  };
}

/**
 * Hook to get user's favorite products
 */
export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          products (
            id,
            name,
            price,
            original_price,
            image_url,
            rating,
            suppliers (
              business_name
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Favorite[];
    },
    enabled: !!userId,
  });
};

/**
 * Hook to check if a product is favorited
 */
export const useIsFavorite = (userId?: string, productId?: string) => {
  return useQuery({
    queryKey: ["is-favorite", userId, productId],
    queryFn: async () => {
      if (!userId || !productId) return false;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!productId,
  });
};

/**
 * Hook to add a product to favorites
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId }: { userId: string; productId: string }) => {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, product_id: productId });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["is-favorite", variables.userId, variables.productId] });
      toast.success("Produit ajouté aux favoris");
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error("Ce produit est déjà dans vos favoris");
      } else {
        toast.error("Erreur lors de l'ajout aux favoris");
      }
    },
  });
};

/**
 * Hook to remove a product from favorites
 */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId }: { userId: string; productId: string }) => {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["is-favorite", variables.userId, variables.productId] });
      toast.success("Produit retiré des favoris");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
};

/**
 * Hook to toggle favorite status
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId, isFavorite }: {
      userId: string;
      productId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["is-favorite", variables.userId, variables.productId] });

      if (variables.isFavorite) {
        toast.success("Produit retiré des favoris");
      } else {
        toast.success("Produit ajouté aux favoris");
      }
    },
    onError: (error: any, variables) => {
      console.error("Error toggling favorite:", error);
      if (error.code === '23505') {
        toast.error("Ce produit est déjà dans vos favoris");
      } else {
        toast.error(`Erreur: ${error.message || "Impossible de modifier les favoris"}`);
      }
    },
  });
};
