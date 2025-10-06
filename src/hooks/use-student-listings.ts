import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentListing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price?: number;
  listing_type: 'sale' | 'exchange' | 'free';
  category: string;
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  image_urls?: string[];
  university?: string;
  location?: string;
  is_active: boolean;
  is_sold: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
  };
}

export const useStudentListings = (universityFilter?: string) => {
  return useQuery({
    queryKey: ["student-listings", universityFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_listings")
        .select(`
          *,
          profiles(full_name)
        `)
        .eq("is_active", true)
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      if (universityFilter) {
        query = query.eq("university", universityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StudentListing[];
    },
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ["my-student-listings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("student_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StudentListing[];
    },
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listing: Omit<StudentListing, "id" | "created_at" | "updated_at" | "user_id" | "views_count" | "is_sold">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté pour créer une annonce");
      
      const { data, error } = await supabase
        .from("student_listings")
        .insert({ ...listing, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-student-listings"] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...listing }: Partial<StudentListing> & { id: string }) => {
      const { data, error } = await supabase
        .from("student_listings")
        .update(listing)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-student-listings"] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("student_listings")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-student-listings"] });
    },
  });
};

export const useIncrementViews = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: listing } = await supabase
        .from("student_listings")
        .select("views_count")
        .eq("id", id)
        .single();
      
      if (listing) {
        const { error } = await supabase
          .from("student_listings")
          .update({ views_count: listing.views_count + 1 })
          .eq("id", id);
        
        if (error) throw error;
      }
    },
  });
};