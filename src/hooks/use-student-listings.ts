import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  EnhancedStudentListing,
  CreateStudentListingInput,
  UpdateStudentListingInput,
  StudentListingFilters,
  ListingType,
  ItemCondition
} from "@/lib/database-types";

// Backward compatibility - export old interface
export interface StudentListing extends EnhancedStudentListing {
  category?: string; // For backward compatibility, will be removed
}

export const useStudentListings = (filters?: StudentListingFilters) => {
  return useQuery({
    queryKey: ["student-listings", filters],
    queryFn: async () => {
      let query = supabase
        .from("student_listings")
        .select(`
          *,
          categories(name, icon_name)
        `)
        .eq("is_active", filters?.is_active ?? true)
        .eq("is_sold", filters?.is_sold ?? false)
        .order("created_at", { ascending: false });

      // Apply filters using indexed columns for better performance
      if (filters?.university) {
        query = query.eq("university", filters.university);
      }

      if (filters?.listing_type) {
        query = query.eq("listing_type", filters.listing_type);
      }

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.condition) {
        query = query.eq("condition", filters.condition);
      }

      if (filters?.min_price !== undefined) {
        query = query.gte("price", filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.lte("price", filters.max_price);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Récupérer les profils des utilisateurs pour chaque listing
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(listing => listing.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        // Mapper les profils aux listings
        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        return data.map(listing => ({
          ...listing,
          profiles: profilesMap.get(listing.user_id)
        })) as EnhancedStudentListing[];
      }

      return data as EnhancedStudentListing[];
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
        .select(`
          *,
          categories(name, icon_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", user.id)
        .single();

      // Mapper le profil à chaque listing
      return data.map(listing => ({
        ...listing,
        profiles: profile
      })) as EnhancedStudentListing[];
    },
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: CreateStudentListingInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté pour créer une annonce");

      const { data, error } = await supabase
        .from("student_listings")
        .insert({ ...listing, user_id: user.id })
        .select(`
          *,
          categories(name, icon_name)
        `)
        .single();

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", user.id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedStudentListing;
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
    mutationFn: async ({ id, ...listing }: UpdateStudentListingInput) => {
      const { data, error } = await supabase
        .from("student_listings")
        .update(listing)
        .eq("id", id)
        .select(`
          *,
          categories(name, icon_name)
        `)
        .single();

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", data.user_id)
        .single();

      return {
        ...data,
        profiles: profile
      } as EnhancedStudentListing;
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