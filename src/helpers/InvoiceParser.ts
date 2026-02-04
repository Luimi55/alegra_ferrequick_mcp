import type{ OriginalInvoice } from "../models/invoice/OriginalInvoice.ts";
import type{ OriginalClient } from "../models/invoice/OriginalClient.ts";
import type{ OriginalNumberTemplate } from "../models/invoice/OriginalNumberTemplate.ts";
import type{ OriginalSeller } from "../models/invoice/OriginalSeller.ts";
import type{ OriginalPayment } from "../models/invoice/OriginalPayment.ts";
import type{ OriginalTax } from "../models/invoice/OriginalTax.ts";
import type{ OriginalItem } from "../models/invoice/OriginalItem.ts";
import type{ SimplifiedInvoice } from "../models/invoice/SimplifiedInvoice.ts";
import type{ SimplifiedClient } from "../models/invoice/SimplifiedClient.ts";
import type{ SimplifiedNumberTemplate } from "../models/invoice/SimplifiedNumberTemplate.ts";
import type{ SimplifiedSeller } from "../models/invoice/SimplifiedSeller.ts";
import type{ SimplifiedPayment } from "../models/invoice/SimplifiedPayment.ts";
import type{ SimplifiedTax } from "../models/invoice/SimplifiedTax.ts";
import type{ SimplifiedItem } from "../models/invoice/SimplifiedItem.ts";
import type{ AxiosResponse } from 'axios';

export function safeParseResponseToOriginalInvoice(data: any): OriginalInvoice[] | null {
  try {
    
    if (!Array.isArray(data)) {
      console.error('Response data is not an array');
      return null;
    }
    
    return data as OriginalInvoice[];
  } catch (error) {
    console.error('Error parsing invoice response:', error);
    return null;
  }
}

export function parseInvoices(originalInvoices: OriginalInvoice[]): SimplifiedInvoice[] {
  return originalInvoices.map(invoice => parseInvoice(invoice));
}

export function parseInvoice(original: OriginalInvoice): SimplifiedInvoice {
  return {
    id: original.id,
    date: original.date,
    dueDate: original.dueDate,
    datetime: original.datetime,
    status: original.status,
    client: parseClient(original.client),
    numberTemplate: parseNumberTemplate(original.numberTemplate),
    subtotal: original.subtotal,
    discount: original.discount,
    tax: original.tax,
    total: original.total,
    totalPaid: original.totalPaid,
    balance: original.balance,
    warehouse: original.warehouse,
    term: original.term,
    incomeType: original.incomeType,
    paymentType: original.paymentType,
    paymentMethod: original.paymentMethod,
    seller: parseSeller(original?.seller)??null,
    priceList: original.priceList,
    payments: original?.payments?.map(parsePayment)??null,
    items: original?.items?.map(parseItem)??null,
    costCenter: original.costCenter,
    printingTemplate: original.printingTemplate,
  };
}

function parseClient(original: OriginalClient|null): SimplifiedClient {
  return {
    id: original?.id??null,
    name: original?.name??null,
    identification: original?.identification??null,
    phonePrimary: original?.phonePrimary??null,
    phoneSecondary: original?.phoneSecondary??null,
    mobile: original?.mobile??null,
    email: original?.email??null,
    identificationType: original?.identificationType??null,
    address: {
      province: original?.address?.province??null,
      municipality: original?.address?.municipality??null,
      description: original?.address?.description??null,
    },
  };
}

function parseNumberTemplate(original: OriginalNumberTemplate|null): SimplifiedNumberTemplate {
  return {
    id: original?.id??null,
    prefix: original?.prefix??null,
    number: original?.number??null,
    documentType: original?.documentType??null,
    fullNumber: original?.fullNumber??null,
  };
}

function parseSeller(original: OriginalSeller|null): SimplifiedSeller {
  return {
    id: original?.id??null,
    name: original?.name??null,
  };
}

function parsePayment(original: OriginalPayment): SimplifiedPayment {
  return {
    id: original.id,
    number: original.number,
    date: original.date,
    amount: original.amount,
    paymentMethod: original.paymentMethod,
    status: original.status,
  };
}

function parseTax(original: OriginalTax): SimplifiedTax {
  return {
    name: original.name,
    percentage: original.percentage,
    status: original.status,
    deductible: original.deductible,
    type: original.type,
    amount: original.amount,
  };
}

function parseItem(original: OriginalItem): SimplifiedItem {
  return {
    name: original.name,
    description: original.description,
    price: original.price,
    discount: original.discount,
    reference: original.reference,
    quantity: original.quantity,
    id: original.id,
    unit: original.unit,
    itemType: original.itemType,
    tax: original?.tax?.map(parseTax)??null,
    total: original.total,
  };
}
