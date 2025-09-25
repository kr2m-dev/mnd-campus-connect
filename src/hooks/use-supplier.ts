import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Supplier {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useCurrentSupplier = () => {
  return useQuery({
    queryKey: ["current-supplier"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Supplier | null;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at" | "is_verified">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");
      
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplier, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-supplier"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: Partial<Supplier>) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-supplier"] });
    },
  });
};