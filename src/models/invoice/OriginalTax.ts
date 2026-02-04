import type{ OriginalCategory } from "./OriginalCategory.ts";

export interface OriginalTax {
  id: string | null;
  name: string | null;
  percentage: string | null;
  description: string | null;
  status: string | null;
  deductible: string | null;
  type: string | null;
  categoryFavorable: OriginalCategory | null;
  categoryToBePaid: OriginalCategory | null;
  amount: number | null;
}
