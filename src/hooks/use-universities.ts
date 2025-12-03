import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  type: 'public' | 'private';
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook to fetch all universities from Supabase
 */
export function useUniversities() {
  return useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching universities:', error);
        throw error;
      }

      return data as University[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour (universities don't change often)
  });
}

/**
 * Hook to fetch a single university by ID
 */
export function useUniversity(universityId: string | undefined) {
  return useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      if (!universityId) return null;

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single();

      if (error) {
        console.error('Error fetching university:', error);
        throw error;
      }

      return data as University;
    },
    enabled: !!universityId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to fetch universities by city
 */
export function useUniversitiesByCity(city: string | undefined) {
  return useQuery({
    queryKey: ['universities', 'city', city],
    queryFn: async () => {
      if (!city) return [];

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .ilike('city', `%${city}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching universities by city:', error);
        throw error;
      }

      return data as University[];
    },
    enabled: !!city,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to fetch universities by type (public/private)
 */
export function useUniversitiesByType(type: 'public' | 'private' | undefined) {
  return useQuery({
    queryKey: ['universities', 'type', type],
    queryFn: async () => {
      if (!type) return [];

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching universities by type:', error);
        throw error;
      }

      return data as University[];
    },
    enabled: !!type,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Utility function to get university by ID from cache or fetch
 */
export function getUniversityById(universities: University[] | undefined, id: string): University | undefined {
  return universities?.find(uni => uni.id === id);
}

/**
 * Utility function to get universities by city from list
 */
export function getUniversitiesByCity(universities: University[] | undefined, city: string): University[] {
  if (!universities) return [];
  return universities.filter(uni =>
    uni.city.toLowerCase().includes(city.toLowerCase())
  );
}
