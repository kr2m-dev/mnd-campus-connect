/**
 * Enhanced Database Types
 * This file contains TypeScript types that match the improved database schema with ENUMs
 */

// ============================================
// ENUMS - Match database ENUMs exactly
// ============================================

export type NotificationType = 'order' | 'message' | 'product' | 'system';

export type ListingType = 'sale' | 'exchange' | 'free';

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// ============================================
// ENUM LABELS - For UI display
// ============================================

export const NotificationTypeLabels: Record<NotificationType, string> = {
  order: 'Commande',
  message: 'Message',
  product: 'Produit',
  system: 'Système',
};

export const ListingTypeLabels: Record<ListingType, string> = {
  sale: 'Vente',
  exchange: 'Échange',
  free: 'Gratuit',
};

export const ItemConditionLabels: Record<ItemCondition, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  good: 'Bon état',
  fair: 'État correct',
  poor: 'Mauvais état',
};

export const OrderStatusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

// ============================================
// ENUM HELPERS
// ============================================

export const NotificationTypes: NotificationType[] = ['order', 'message', 'product', 'system'];
export const ListingTypes: ListingType[] = ['sale', 'exchange', 'free'];
export const ItemConditions: ItemCondition[] = ['new', 'like_new', 'good', 'fair', 'poor'];
export const OrderStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

// ============================================
// TYPE GUARDS
// ============================================

export function isNotificationType(value: string): value is NotificationType {
  return NotificationTypes.includes(value as NotificationType);
}

export function isListingType(value: string): value is ListingType {
  return ListingTypes.includes(value as ListingType);
}

export function isItemCondition(value: string): value is ItemCondition {
  return ItemConditions.includes(value as ItemCondition);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return OrderStatuses.includes(value as OrderStatus);
}

// ============================================
// ENHANCED ENTITY TYPES
// ============================================

export interface EnhancedProduct {
  id: string;
  name: string;
  description?: string;
  price: number; // numeric(10,2)
  original_price?: number; // numeric(10,2)
  category_id?: string;
  image_url?: string;
  university_filter?: string;
  is_active: boolean;
  stock_quantity: number; // CHECK >= 0
  rating: number; // numeric(3,2), CHECK 0-5
  created_at: string;
  updated_at: string;
  supplier_id: string;
  categories?: {
    name: string;
    icon_name?: string;
  };
  suppliers?: {
    business_name: string;
    contact_whatsapp?: string;
  };
}

export interface EnhancedStudentListing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price?: number; // numeric(10,2)
  listing_type: ListingType;
  category_id?: string; // Now references categories table
  condition?: ItemCondition;
  image_urls?: string[]; // text[] array type
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
  categories?: {
    name: string;
    icon_name?: string;
  };
}

export interface EnhancedOrder {
  id: string;
  user_id: string;
  supplier_id?: string;
  status: OrderStatus;
  total_amount: number; // numeric(10,2)
  delivery_address?: string;
  delivery_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    phone?: string;
  };
  suppliers?: {
    business_name: string;
    contact_phone?: string;
  };
}

export interface EnhancedOrderItem {
  id: string;
  order_id: string;
  product_id?: string; // Can be null if product deleted
  product_name: string;
  product_price: number; // numeric(10,2)
  quantity: number;
  subtotal: number; // numeric(10,2)
  created_at: string;
}

export interface EnhancedNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface EnhancedMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string; // Max 255 chars
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name?: string;
  };
  recipient?: {
    full_name?: string;
  };
}

// ============================================
// FORM TYPES - For creating/updating entities
// ============================================

export type CreateStudentListingInput = Omit<
  EnhancedStudentListing,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'views_count' | 'is_sold' | 'profiles' | 'categories'
>;

export type UpdateStudentListingInput = Partial<CreateStudentListingInput> & { id: string };

export type CreateProductInput = Omit<
  EnhancedProduct,
  'id' | 'created_at' | 'updated_at' | 'supplier_id' | 'categories' | 'suppliers'
>;

export type UpdateProductInput = Partial<CreateProductInput> & { id: string };

export type CreateOrderInput = Omit<
  EnhancedOrder,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'profiles' | 'suppliers'
>;

export type UpdateOrderInput = Partial<Pick<EnhancedOrder, 'status' | 'delivery_address' | 'delivery_phone' | 'notes'>> & { id: string };

export type CreateNotificationInput = Omit<EnhancedNotification, 'id' | 'created_at' | 'is_read'>;

// ============================================
// QUERY FILTERS
// ============================================

export interface ProductFilters {
  category_id?: string;
  university?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_active?: boolean;
}

export interface StudentListingFilters {
  listing_type?: ListingType;
  category_id?: string;
  condition?: ItemCondition;
  university?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_active?: boolean;
  is_sold?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus;
  supplier_id?: string;
  date_from?: string;
  date_to?: string;
}
