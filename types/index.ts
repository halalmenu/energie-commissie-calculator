export interface Supplier {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface AgentRole {
  id: string;
  name: string;
}

export interface CommissionRule {
  id: string;
  supplier_id: string;
  role_id: string;
  rate_per_kwh: number;
  rate_per_m3: number;
  rate_per_ean: number;
  has_tiered_pricing: boolean;
  percentage_modifier: number;
  supplier?: Supplier; // joined
  tiers?: TieredRate[]; // joined
}

export interface TieredRate {
  id: string;
  rule_id: string;
  product_type: 'electricity' | 'gas';
  min_volume: number;
  max_volume: number | null;
  fixed_fee: number;
}

export interface CalculationResult {
  supplierName: string;
  totalCommission: number;
  breakdown: {
    electricity: number;
    gas: number;
    baseFee: number;
    bonus?: number;
  };
  details: string;
}

