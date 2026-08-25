import { Product } from "@/services/drizzle/schemas";

export interface StockSummary {
  quantityOnHand: string;
  averageCost: string;
}

export interface ProductsOperationsClientProps {
  companyId: string;
  products: Product[];
  totalProducts: number;
  stockSummaries?: Record<string, StockSummary>;
  userRole: string;
}
