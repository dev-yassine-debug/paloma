
import type { Product, CartItem, UserFavorite } from "@/types";

// Validation functions
export const validateProductStatus = (status: any): string => {
  const validStatuses = ['approved', 'pending', 'rejected'];
  return validStatuses.includes(status) ? status : 'pending';
};

export const validateProduct = (product: any): Product => {
  return {
    id: product.id,
    name: product.name || '',
    description: product.description,
    price: parseFloat(product.price) || 0,
    quantity: parseInt(product.quantity) || 0,
    image_url: product.image_url,
    video_url: product.video_url,
    category: product.category,
    status: validateProductStatus(product.status),
    seller_id: product.seller_id,
    latitude: product.latitude ? parseFloat(product.latitude) : undefined,
    longitude: product.longitude ? parseFloat(product.longitude) : undefined,
    average_rating: parseFloat(product.average_rating) || 0,
    review_count: parseInt(product.review_count) || 0,
    created_at: product.created_at,
    updated_at: product.updated_at,
    profiles: product.profiles,
  };
};

export const validateCartItem = (item: any): CartItem => {
  return {
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    quantity: parseInt(item.quantity) || 1,
    created_at: item.created_at,
    updated_at: item.updated_at,
    products: item.products ? validateProduct(item.products) : undefined,
  };
};

export const validateUserFavorite = (item: any): UserFavorite => {
  return {
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    products: item.products ? validateProduct(item.products) : undefined,
  };
};

// Batch validation functions
export const validateCartItems = (items: any[]): CartItem[] => {
  return items.map(validateCartItem);
};

export const validateUserFavorites = (items: any[]): UserFavorite[] => {
  return items.map(validateUserFavorite);
};

export const validateProducts = (products: any[]): Product[] => {
  return products.map(validateProduct);
};
