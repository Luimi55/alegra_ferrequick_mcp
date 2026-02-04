import type{ SimplifiedTax } from "./SimplifiedTax.ts";

export interface SimplifiedItem {
  name: string | null;
  description: string | null;
  price: number | null;
  discount: number | null;
  reference: string | null;
  quantity: number | null;
  id: string | null;
  unit: string | null;
  itemType: string | null;
  tax: SimplifiedTax[] | null;
  total: number | null;
}
