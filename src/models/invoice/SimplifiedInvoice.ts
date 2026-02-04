import type{ SimplifiedClient } from "./SimplifiedClient.ts";
import type{ SimplifiedNumberTemplate } from "./SimplifiedNumberTemplate.ts";
import type{ SimplifiedWarehouse } from "./SimplifiedWarehouse.ts";
import type{ SimplifiedSeller } from "./SimplifiedSeller.ts";
import type{ SimplifiedPriceList } from "./SimplifiedPriceList.ts";
import type{ SimplifiedPayment } from "./SimplifiedPayment.ts";
import type{ SimplifiedItem } from "./SimplifiedItem.ts";
import type{ SimplifiedPrintingTemplate } from "./SimplifiedPrintingTemplate.ts";

export interface SimplifiedInvoice {
  id: string | null;
  date: string | null;
  dueDate: string | null;
  datetime: string | null;
  status: string | null;
  client: SimplifiedClient | null;
  numberTemplate: SimplifiedNumberTemplate | null;
  subtotal: number | null;
  discount: number | null;
  tax: number | null;
  total: number | null;
  totalPaid: number | null;
  balance: number | null;
  warehouse: SimplifiedWarehouse | null;
  term: string | null;
  incomeType: string | null;
  paymentType: string | null;
  paymentMethod: string | null;
  seller: SimplifiedSeller | null;
  priceList: SimplifiedPriceList | null;
  payments: SimplifiedPayment[] | null;
  items: SimplifiedItem[] | null;
  costCenter: any | null;
  printingTemplate: SimplifiedPrintingTemplate | null;
}
