import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  EnhancedProduct,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters
} from "@/lib/database-types";

// Backward compatibility - export old interface
export interface Product extends EnhancedProduct {}

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name, contact_whatsapp)
        `)
        .eq("is_active", filters?.is_active ?? true)
        .order("created_at", { ascending: false });

      // Apply filters using indexed columns for better performance
      if (filters?.university) {
        query = query.or(`university_filter.eq.${filters.university},university_filter.is.null,university_filter.eq.`);
      }

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.min_price !== undefined) {
        query = query.gte("price", filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.lte("price", filters.max_price);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EnhancedProduct[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: CreateProductInput) => {
      // Get current supplier
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!supplier) throw new Error("Vous devez être fournisseur pour ajouter des produits");

      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, supplier_id: supplier.id })
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name, contact_whatsapp)
        `)
        .single();

      if (error) throw error;
      return data as EnhancedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: UpdateProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name, contact_whatsapp)
        `)
        .single();

      if (error) throw error;
      return data as EnhancedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};