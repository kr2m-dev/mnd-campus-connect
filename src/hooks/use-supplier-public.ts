import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedProduct } from "@/lib/database-types";

export interface PublicSupplier {
  id: string;
  business_name: string;
  description?: string;
  address?: string;
  logo_url?: string;
  is_verified: boolean;
  shop_slug?: string;
  created_at: string;
}

export const useSupplierBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["supplier-by-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      // Try exact match on shop_slug first
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, business_name, description, address, logo_url, is_verified, shop_slug, created_at")
        .eq("shop_slug", slug)
        .maybeSingle();

      if (error) throw error;
      return (data as PublicSupplier) || null;
    },
  });
};

export const useProductsBySupplier = (supplierId: string, search?: string) => {
  return useQuery({
    queryKey: ["products-by-supplier", supplierId, search],
    enabled: !!supplierId,
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name, contact_whatsapp)
        `)
        .eq("supplier_id", supplierId)
        .eq("is_active", true);

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnhancedProduct[];
    },
  });
};
