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
      // Get universities count
      const { count: universitiesCount } = await supabase
        .from("universities")
        .select("*", { count: "exact", head: true });

      // Get students count (profiles)
      const { count: studentsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get active listings count
      const { count: activeListingsCount } = await supabase
        .from("student_listings")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get average rating from products
      const { data: productsData } = await supabase
        .from("products")
        .select("rating")
        .gt("rating", 0);

      const averageRating = productsData && productsData.length > 0
        ? productsData.reduce((sum, p) => sum + p.rating, 0) / productsData.length
        : 4.8;

      return {
        universitiesCount: universitiesCount || 0,
        studentsCount: studentsCount || 0,
        activeListingsCount: activeListingsCount || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
