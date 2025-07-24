
export interface Commission {
  id: string;
  order_id: string;
  product_price: number;
  commission: number;
  cashback: number;
  admin_gain: number;
  total_paid: number;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  buyer_name?: string;
  seller_name?: string;
  buyer_phone?: string;
  seller_phone?: string;
  order_total?: number;
  product_name?: string;
  product_category?: string;
  commission_rate?: number;
  status?: string;
}

export interface CommissionStats {
  total_commissions: number;
  total_cashback: number;
  total_admin_gain: number;
  transactions_count: number;
}

export interface CommissionSettings {
  id: string;
  customer_commission_percent: number;
  seller_withdrawal_fee_percent: number;
  cashback_percent: number;
  created_at: string;
  updated_at: string;
}
