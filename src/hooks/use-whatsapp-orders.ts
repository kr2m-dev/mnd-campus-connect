import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CommandeStatut = "en_cours" | "complet" | "annule";

export interface CommandeWhatsApp {
  id: string;
  supplier_id: string;
  product_id?: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  statut: CommandeStatut;
  user_id?: string | null;
  created_at: string;
}

export interface CreateCommandeInput {
  supplier_id: string;
  product_id?: string | null;
  product_name: string;
  product_price: number;
  quantity?: number;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  user_id?: string | null;
}

export const useCreateWhatsAppOrder = () => {
  return useMutation({
    mutationFn: async (input: CreateCommandeInput) => {
      const { data, error } = await supabase
        .from("commandes_whatsapp")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as CommandeWhatsApp;
    },
  });
};

export const useSupplierWhatsAppOrders = (supplierId: string) => {
  return useQuery({
    queryKey: ["commandes-whatsapp", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commandes_whatsapp")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommandeWhatsApp[];
    },
  });
};

export const useUpdateCommandeStatut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: CommandeStatut }) => {
      const { data, error } = await supabase
        .from("commandes_whatsapp")
        .update({ statut })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CommandeWhatsApp;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["commandes-whatsapp", data.supplier_id] });
    },
  });
};
