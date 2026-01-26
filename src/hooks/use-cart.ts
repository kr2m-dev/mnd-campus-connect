import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCart = (userId?: string) => {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Récupérer les articles du panier avec les produits
      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            original_price,
            image_url,
            stock_quantity,
            supplier_id,
            categories (
              name
            )
          )
        `)
        .eq("user_id", userId);

      if (cartError) throw cartError;
      if (!cartData || cartData.length === 0) return [];

      // Récupérer les IDs uniques des fournisseurs
      const supplierIds = [...new Set(
        cartData
          .map((item: any) => item.products?.supplier_id)
          .filter(Boolean)
      )];

      // Récupérer les informations des fournisseurs via la vue suppliers_with_contact
      // Cette vue expose contact_whatsapp pour les utilisateurs ayant des commandes
      const { data: suppliersData } = await supabase
        .from("suppliers_with_contact")
        .select("id, business_name, contact_whatsapp")
        .in("id", supplierIds);

      // Créer un map des fournisseurs
      const suppliersMap = new Map(
        (suppliersData || []).map((s: any) => [s.id, s])
      );

      // Enrichir les articles avec les informations des fournisseurs
      const enrichedData = cartData.map((item: any) => ({
        ...item,
        products: item.products ? {
          ...item.products,
          suppliers: suppliersMap.get(item.products.supplier_id) || null
        } : null
      }));

      return enrichedData;
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, productId, quantity }: { userId: string; productId: string; quantity: number }) => {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: userId, product_id: productId, quantity });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cart", variables.userId] });
      toast.success("Produit ajouté au panier");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout au panier");
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId, quantity, userId }: { cartItemId: string; quantity: number; userId: string }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId);

      if (error) throw error;
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart", data.userId] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId, userId }: { cartItemId: string; userId: string }) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart", data.userId] });
      toast.success("Produit retiré du panier");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
};
