import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to a URL-friendly slug
 * Example: "Laptop Dell XPS 13" => "laptop-dell-xps-13"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Checks if a slugified product name matches a slug
 * Example: matchSlug("Laptop Dell XPS 13", "laptop-dell-xps-13") => true
 */
export function matchSlug(productName: string, slug: string): boolean {
  return slugify(productName) === slug;
}
