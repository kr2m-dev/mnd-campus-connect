import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/hooks/use-supplier";
import { EnhancedProduct } from "@/lib/database-types";
import { slugify } from "@/lib/utils";

export const useSupplierBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["supplier-by-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*");

      if (error) throw error;

      const found = (data as Supplier[]).find(
        (s) => slugify(s.business_name) === slug
      );

      return found || null;
    },
  });
};

export const useProductsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ["products-by-supplier", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, icon_name),
          suppliers(business_name, contact_whatsapp)
        `)
        .eq("supplier_id", supplierId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EnhancedProduct[];
    },
  });
};
