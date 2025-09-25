import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id?: string;
  image_url?: string;
  university_filter?: string;
  is_active: boolean;
  stock_quantity: number;
  rating: number;
  created_at: string;
  updated_at: string;
  supplier_id: string;
  categories?: {
    name: string;
    icon_name?: string;
  };
  suppliers?: {
    business_name: string;
  };
}

export const useProducts = (universityFilter?: string) => {
  return useQuery({
    queryKey: ["products", universityFilter],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (universityFilter) {
        query = query.or(`university_filter.eq.${universityFilter},university_filter.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at" | "supplier_id">) => {
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
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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