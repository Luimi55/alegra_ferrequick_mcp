import type{ OriginalTax } from "./OriginalTax.ts";

export interface OriginalItem {
  name: string | null;
  description: string | null;
  price: number | null;
  discount: number | null;
  reference: string | null;
  quantity: number | null;
  id: string | null;
  unit: string | null;
  itemType: string | null;
  tax: OriginalTax[] | null;
  total: number | null;
}
