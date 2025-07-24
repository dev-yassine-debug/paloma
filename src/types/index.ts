// User and Profile Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  role: 'admin' | 'seller' | 'client' | 'banned';
  created_at?: string;
  updated_at?: string;
}

// Product Types - Enhanced with service fields and admin management fields
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  image_url?: string;
  video_url?: string;
  category?: string;
  category_id?: string; // Added for admin management
  status?: string;
  seller_id?: string;
  latitude?: number;
  longitude?: number;
  average_rating: number;
  review_count: number;
  created_at?: string;
  updated_at?: string;
  type?: 'product' | 'service';
  duration_hours?: number; // Service field
  available_days?: string[]; // Service field
  start_time?: string; // Service field
  end_time?: string; // Service field
  // Admin management fields
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  profiles?: {
    name?: string;
    phone?: string;
    city?: string;
  };
  product_categories?: {
    name_ar?: string;
    slug?: string;
  };
}

// Admin Stats Types
export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalClients: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  commissions: number;
}

// Cart Types - Ajustement pour correspondre à la structure Supabase
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
  products?: Product; // Made optional and singular to match Supabase relation
}

// Favorites Types - Ajustement pour correspondre à la structure Supabase
export interface UserFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product; // Made optional and singular to match Supabase relation
}

// Order Types - Enhanced with ALL necessary fields
export interface Order {
  id: string;
  buyer_id?: string;
  seller_id?: string;
  product_id?: string;
  quantity: number;
  total_amount: number;
  original_amount?: number;
  commission?: number;
  admin_commission?: number;
  cashback?: number;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  delivery_status?: string;
  delivery_confirmation_date?: string;
  rejection_reason?: string;
  type?: 'product' | 'service';
  service_date?: string; // For services
  service_time?: string; // For services
  created_at?: string;
  updated_at?: string;
  // Relations for admin view
  products?: {
    name: string;
    price: number;
  };
  buyer_profile?: {
    id: string;
    name: string;
    phone: string;
  };
  seller_profile?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at?: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  user_id?: string;
  balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  provider?: string;
  transaction_id?: string;
  category?: string;
  description_ar?: string;
  description_en?: string;
  admin_commission?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Admin Wallet Types
export interface AdminWallet {
  id: string;
  balance: number;
  total_commissions?: number;
  total_transactions?: number;
  created_at?: string;
  updated_at?: string;
}

// Enhanced User Profile with Wallet for Admin View
export interface UserWithWallet extends Profile {
  wallet?: Wallet;
  wallet_balance?: number;
}

// Wallet Operation Types
export interface WalletOperation {
  operation: 'admin_transfer' | 'recharge' | 'withdrawal';
  user_id?: string;
  target_user_id?: string;
  amount: number;
  description_ar?: string;
  description_en?: string;
}

// Enhanced transaction statistics
export interface WalletStatistics {
  total_users_with_wallets: number;
  total_balance: number;
  total_transactions: number;
  avg_balance: number;
  total_admin_recharges: number;
  total_telr_recharges: number;
}

export interface WalletOperationResponse {
  success: boolean;
  message: string;
  data?: {
    amount: number;
    new_user_balance: number;
    new_admin_balance?: number;
  };
  error?: string;
}

// Reviews Types
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// Location Types
export interface SellerLocation {
  id: string;
  seller_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Ads Types
export interface Ad {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
  seller_id?: string;
  created_by: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

// Commission Settings Types
export interface CommissionSettings {
  id: string;
  customer_commission_percent: number;
  seller_withdrawal_fee_percent: number;
  cashback_percent: number;
  created_at: string;
  updated_at: string;
}

// Component Props Types
export interface ProductGridProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedSellerId?: string;
  userLocation?: { lat: number; lng: number };
}

export interface ProductSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export interface CartProps {
  user: User;
}

export interface WalletManagerProps {
  user: User;
}

export interface UserProfileProps {
  user: User;
}

export interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemsCount: number;
  favoritesCount: number;
  onCartOpen?: () => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// OTP Types
export interface OTPResponse {
  success: boolean;
  message: string;
  phone?: string;
  role?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: User;
  profile?: Profile;
  token?: string;
}

// Type Guards and Validators
export const isValidProductStatus = (status: string): status is 'approved' | 'pending' | 'rejected' => {
  return ['approved', 'pending', 'rejected'].includes(status);
};

export const validateProduct = (product: any): Product => {
  return {
    ...product,
    status: isValidProductStatus(product.status) ? product.status : 'pending',
    average_rating: product.average_rating || 0,
    review_count: product.review_count || 0,
    type: (product.type === 'service' ? 'service' : 'product') as 'product' | 'service',
  };
};

// Data transformation utilities
export const transformSupabaseCartItem = (item: any): CartItem => {
  return {
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    quantity: item.quantity,
    created_at: item.created_at,
    updated_at: item.updated_at,
    products: item.products ? validateProduct(item.products) : undefined,
  };
};

export const transformSupabaseFavorite = (item: any): UserFavorite => {
  return {
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    products: item.products ? validateProduct(item.products) : undefined,
  };
};

// Wallet Types
export interface Wallet {
  id: string;
  user_id?: string;
  balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  provider?: string;
  transaction_id?: string;
  category?: string;
  description_ar?: string;
  description_en?: string;
  admin_commission?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Admin Wallet Types
export interface AdminWallet {
  id: string;
  balance: number;
  total_commissions?: number;
  total_transactions?: number;
  created_at?: string;
  updated_at?: string;
}

// Enhanced User Profile with Wallet for Admin View
export interface UserWithWallet extends Profile {
  wallet?: Wallet;
  wallet_balance?: number;
}

// Wallet Operation Types
export interface WalletOperation {
  operation: 'admin_transfer' | 'recharge' | 'withdrawal';
  user_id?: string;
  target_user_id?: string;
  amount: number;
  description_ar?: string;
  description_en?: string;
}

// Enhanced transaction statistics
export interface WalletStatistics {
  total_users_with_wallets: number;
  total_balance: number;
  total_transactions: number;
  avg_balance: number;
  total_admin_recharges: number;
  total_telr_recharges: number;
}

export interface WalletOperationResponse {
  success: boolean;
  message: string;
  data?: {
    amount: number;
    new_user_balance: number;
    new_admin_balance?: number;
  };
  error?: string;
}
