import axios from 'axios';
import type{ AxiosInstance, AxiosError } from 'axios';

interface AlegraConfig {
  username: string;
  apiToken: string;
  baseURL?: string;
}

interface InvoiceQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "id" | "name" | "date" | "dueDate" | "status";
  id?: string;
  date?: string;
  dueDate?: string;
  status?: string;
  client_id?: string;
  client_name?: string;
  client_identification?: string;
  item_id?: string;
  date_after?: string;
  date_afterOrNow?: string;
  date_before?: string;
  date_beforeOrNow?: string;
  dueDate_after?: string;
  dueDate_afterOrNow?: string;
  dueDate_before?: string;
  dueDate_beforeOrNow?: string;
}

interface PaymentsReceivedQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "id" | "number" | "date" | "type";
  type?: "in" | "out";
  id?: string;
  client_id?: string;
  conciliation_id?: string;
}

interface PurchaseInvoicesQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "date" | "name" | "dueDate";
  billNumber?: string;
  client_name?: string;
  date?: string;
  dueDate?: string;
  status?: string;
  item_id?: string;
  client_id?: string;
  provider_name?: string;
  purchaseOrder_id?: string;
  type?: "bill" | "supportDocument" | "all";
}

interface ProductsAndServicesQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "name" | "id" | "reference" | "description";
  query?: string;
  idWarehouse?: string;
  name?: string;
  price?: string;
  description?: string;
  priceList_id?: string;
  idItemCategory?: string;
  type?: "simple" | "kit";
  status?: "active" | "inactive";
  inventariable?: boolean;
  mode?: "advanced" | "simple";
}

interface InventoryAdjustmentsQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "id" | "number" | "date" | "observations" | "warehouse_name";
  number?: number;
  date?: string;
  warehouse_id?: string;
}

interface WarehousesQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: string;
  name?: string;
  status?: "active" | "inactive";
}

interface BankAccountsQueryParams extends PaginationParams {
  order_direction?: "ASC" | "DESC";
  order_field?: "id" | "date";
  fields?: "deletable" | "journal" | "lastMovementDate" | "category";
  includeInactive?: boolean;
  includeBalance?: boolean;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface AlegraResponse<T> {
  data: T;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}

export class AlegraClient {
  private client: AxiosInstance;

  constructor(config: AlegraConfig) {
    if (!config.username || !config.apiToken) {
      throw new Error("Alegra username and apiToken are required");
    }

    const auth = Buffer.from(
      `${config.username}:${config.apiToken}`
    ).toString("base64");

    this.client = axios.create({
      baseURL: config.baseURL || "https://api.alegra.com/api/v1",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    // this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          throw new Error(
            `Alegra API error (${status}): ${JSON.stringify(data)}`
          );
        } else if (error.request) {
          throw new Error("No response received from Alegra API");
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  private buildPaginationParams(params: PaginationParams = {}): {
    start: number;
    limit: number;
  } {
    const page = params.page || 1;
    const limit = params.limit || 30;
    return {
      start: (page - 1) * limit,
      limit,
    };
  }

  // Facturas de venta (Sales Invoices)
async getSalesInvoices(params: InvoiceQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
    order_direction: filterParams.order_direction || "DESC",
    order_field: filterParams.order_field || "date",
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.id) queryParams.id = filterParams.id;
  if (filterParams.date) queryParams.date = filterParams.date;
  if (filterParams.dueDate) queryParams.dueDate = filterParams.dueDate;
  if (filterParams.status) queryParams.status = filterParams.status;
  if (filterParams.client_id) queryParams.client_id = filterParams.client_id;
  if (filterParams.client_name) queryParams.client_name = filterParams.client_name;
  if (filterParams.client_identification) queryParams.client_identification = filterParams.client_identification;
  if (filterParams.item_id) queryParams.item_id = filterParams.item_id;
  if (filterParams.date_after) queryParams.date_after = filterParams.date_after;
  if (filterParams.date_afterOrNow) queryParams.date_afterOrNow = filterParams.date_afterOrNow;
  if (filterParams.date_before) queryParams.date_before = filterParams.date_before;
  if (filterParams.date_beforeOrNow) queryParams.date_beforeOrNow = filterParams.date_beforeOrNow;
  if (filterParams.dueDate_after) queryParams.dueDate_after = filterParams.dueDate_after;
  if (filterParams.dueDate_afterOrNow) queryParams.dueDate_afterOrNow = filterParams.dueDate_afterOrNow;
  if (filterParams.dueDate_before) queryParams.dueDate_before = filterParams.dueDate_before;
  if (filterParams.dueDate_beforeOrNow) queryParams.dueDate_beforeOrNow = filterParams.dueDate_beforeOrNow;

  const response = await this.client.get("/invoices", {
    params: queryParams,
  });
  
  return response.data;
}

  // Pagos recibidos (Payments Received)
async getPaymentsReceived(params: PaymentsReceivedQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
    order_direction: filterParams.order_direction || "DESC",
    order_field: filterParams.order_field || "date",
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.type) queryParams.type = filterParams.type;
  if (filterParams.id) queryParams.id = filterParams.id;
  if (filterParams.client_id) queryParams.client_id = filterParams.client_id;
  if (filterParams.conciliation_id) queryParams.conciliation_id = filterParams.conciliation_id;

  const response = await this.client.get("/payments", {
    params: queryParams,
  });
  
  return response.data;
}

async getPurchaseInvoices(params: PurchaseInvoicesQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
    order_direction: filterParams.order_direction || "DESC",
    order_field: filterParams.order_field || "date",
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.billNumber) queryParams.billNumber = filterParams.billNumber;
  if (filterParams.client_name) queryParams.client_name = filterParams.client_name;
  if (filterParams.date) queryParams.date = filterParams.date;
  if (filterParams.dueDate) queryParams.dueDate = filterParams.dueDate;
  if (filterParams.status) queryParams.status = filterParams.status;
  if (filterParams.item_id) queryParams.item_id = filterParams.item_id;
  if (filterParams.client_id) queryParams.client_id = filterParams.client_id;
  if (filterParams.provider_name) queryParams.provider_name = filterParams.provider_name;
  if (filterParams.purchaseOrder_id) queryParams.purchaseOrder_id = filterParams.purchaseOrder_id;
  if (filterParams.type) queryParams.type = filterParams.type;

  const response = await this.client.get("/bills", {
    params: queryParams,
  });
  
  return response.data;
}

async getProductsAndServices(params: ProductsAndServicesQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
    order_direction: filterParams.order_direction || "ASC",
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.order_field) queryParams.order_field = filterParams.order_field;
  if (filterParams.query) queryParams.query = filterParams.query;
  if (filterParams.idWarehouse) queryParams.idWarehouse = filterParams.idWarehouse;
  if (filterParams.name) queryParams.name = filterParams.name;
  if (filterParams.price) queryParams.price = filterParams.price;
  if (filterParams.description) queryParams.description = filterParams.description;
  if (filterParams.priceList_id) queryParams.priceList_id = filterParams.priceList_id;
  if (filterParams.idItemCategory) queryParams.idItemCategory = filterParams.idItemCategory;
  if (filterParams.type) queryParams.type = filterParams.type;
  if (filterParams.status) queryParams.status = filterParams.status;
  if (filterParams.inventariable !== undefined) queryParams.inventariable = filterParams.inventariable;
  if (filterParams.mode) queryParams.mode = filterParams.mode;

  const response = await this.client.get("/items", {
    params: queryParams,
  });
  
  return response.data;
}


async getInventoryAdjustments(params: InventoryAdjustmentsQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
    order_direction: filterParams.order_direction || "DESC",
    order_field: filterParams.order_field || "date",
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.number !== undefined) queryParams.number = filterParams.number;
  if (filterParams.date) queryParams.date = filterParams.date;
  if (filterParams.warehouse_id) queryParams.warehouse_id = filterParams.warehouse_id;

  const response = await this.client.get("/inventory-adjustments", {
    params: queryParams,
  });
  
  return response.data;
}

async getWarehouses(params: WarehousesQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.order_direction) queryParams.order_direction = filterParams.order_direction;
  if (filterParams.order_field) queryParams.order_field = filterParams.order_field;
  if (filterParams.name) queryParams.name = filterParams.name;
  if (filterParams.status) queryParams.status = filterParams.status;

  const response = await this.client.get("/warehouses", {
    params: queryParams,
  });
  
  return response.data;
}


async getBankAccounts(params: BankAccountsQueryParams = {}): Promise<any> {
  const { page, limit, ...filterParams } = params;
  const { start, limit: paginationLimit } = this.buildPaginationParams({ page, limit });
  
  // Build query parameters
  const queryParams: Record<string, any> = {
    start,
    limit: paginationLimit,
  };

  // Add optional filter parameters only if they are provided
  if (filterParams.order_direction) queryParams.order_direction = filterParams.order_direction;
  if (filterParams.order_field) queryParams.order_field = filterParams.order_field;
  if (filterParams.fields) queryParams.fields = filterParams.fields;
  if (filterParams.includeInactive !== undefined) queryParams.includeInactive = filterParams.includeInactive;
  if (filterParams.includeBalance !== undefined) queryParams.includeBalance = filterParams.includeBalance;

  const response = await this.client.get("/bank-accounts", {
    params: queryParams,
  });
  
  return response.data;
}

  // Libro de diario (Journal Entries)
  async getJournalEntries(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/journal-entries", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Helper method to get a specific sales invoice by ID
  async getSalesInvoiceById(id: string): Promise<any> {
    const response = await this.client.get(`/invoices/${id}`);
    return response.data;
  }

  // Helper method to get a specific product by ID
  async getProductById(id: string): Promise<any> {
    const response = await this.client.get(`/items/${id}`);
    return response.data;
  }

  // Helper method to get a specific purchase invoice by ID
  async getPurchaseInvoiceById(id: string): Promise<any> {
    const response = await this.client.get(`/bills/${id}`);
    return response.data;
  }

  // Helper method to get a specific journal entry by ID
  async getJournalEntryById(id: string): Promise<any> {
    const response = await this.client.get(`/journal-entries/${id}`);
    return response.data;
  }
}

export default AlegraClient;