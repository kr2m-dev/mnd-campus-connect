import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

// Hook pour récupérer les avis des produits d'un fournisseur
export const useSupplierReviews = (supplierId?: string) => {
  return useQuery({
    queryKey: ["supplier-reviews", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products!inner (
            id,
            name,
            image_url,
            supplier_id
          )
        `)
        .eq("products.supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId,
  });
};

// Hook pour récupérer les avis d'un produit spécifique
export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
  });
};

// Hook pour récupérer tous les avis (admin)
export const useAllReviews = () => {
  return useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (
            id,
            name,
            image_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour supprimer un avis (admin ou fournisseur)
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      toast.success("Avis supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'avis");
    },
  });
};

// Hook pour ajouter un avis (client)
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      user_id: string;
      product_id: string;
      order_id?: string;
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .insert(review);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["supplier-reviews"] });
      toast.success("Avis ajouté avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'avis");
    },
  });
};
