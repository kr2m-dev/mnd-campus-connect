import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  universitiesCount: number;
  studentsCount: number;
  activeListingsCount: number;
  averageRating: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Use SECURITY DEFINER RPC to safely bypass RLS for public counts
      // (avoids the 500 from the recursive profiles RLS policy)
      const { data, error } = await supabase.rpc("get_platform_stats");

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          universitiesCount: Number(row.universities_count) || 0,
          studentsCount: Number(row.students_count) || 0,
          activeListingsCount: Number(row.active_listings_count) || 0,
          averageRating: Number(row.average_rating) || 4.8,
        };
      }

      // Fallback: try individual queries (may fail for unauthenticated users)
      try {
        const [uniResult, listingsResult, productsResult] = await Promise.all([
          supabase.from("universities").select("*", { count: "exact", head: true }),
          supabase.from("student_listings").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("products").select("rating").gt("rating", 0),
        ]);

        const averageRating = productsResult.data && productsResult.data.length > 0
          ? productsResult.data.reduce((sum, p) => sum + p.rating, 0) / productsResult.data.length
          : 4.8;

        return {
          universitiesCount: uniResult.count || 0,
          studentsCount: 0,
          activeListingsCount: listingsResult.count || 0,
          averageRating: Math.round(averageRating * 10) / 10,
        };
      } catch {
        return {
          universitiesCount: 0,
          studentsCount: 0,
          activeListingsCount: 0,
          averageRating: 4.8,
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on 500 errors
  });
};
