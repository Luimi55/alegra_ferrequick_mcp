import type{ OriginalClient } from "./OriginalClient.ts";
import type{ OriginalNumberTemplate } from "./OriginalNumberTemplate.ts";
import type{ OriginalWarehouse } from "./OriginalWarehouse.ts";
import type{ OriginalSeller } from "./OriginalSeller.ts";
import type{ OriginalPriceList } from "./OriginalPriceList.ts";
import type{ OriginalPayment } from "./OriginalPayment.ts";
import type{ OriginalItem } from "./OriginalItem.ts";
import type{ OriginalPrintingTemplate } from "./OriginalPrintingTemplate.ts";

export interface OriginalInvoice {
  id: string | null;
  date: string | null;
  dueDate: string | null;
  datetime: string | null;
  observations: string | null;
  anotation: string | null;
  termsConditions: string | null;
  status: string | null;
  client: OriginalClient | null;
  numberTemplate: OriginalNumberTemplate | null;
  subtotal: number | null;
  discount: number | null;
  tax: number | null;
  total: number | null;
  totalPaid: number | null;
  balance: number | null;
  decimalPrecision: string | null;
  warehouse: OriginalWarehouse | null;
  term: string | null;
  incomeType: string | null;
  paymentType: string | null;
  paymentMethod: string | null;
  seller: OriginalSeller | null;
  priceList: OriginalPriceList | null;
  payments: OriginalPayment[] | null;
  items: OriginalItem[] | null;
  costCenter: any | null;
  printingTemplate: OriginalPrintingTemplate | null;
}
