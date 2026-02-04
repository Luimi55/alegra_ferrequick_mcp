import axios from 'axios';
import type{ AxiosInstance, AxiosError } from 'axios';

interface AlegraConfig {
  username: string;
  apiToken: string;
  baseURL?: string;
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
  async getSalesInvoices(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/invoices", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Pagos recibidos (Payments Received)
  async getPaymentsReceived(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/payments", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Productos y servicios (Products and Services)
  async getProductsAndServices(
    params: PaginationParams = {}
  ): Promise<unknown> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/items", {
      params: {
        start,
        limit,
        order_direction: "DESC",
      },
    });
    return response.data;
  }

  // Valor de inventario (Inventory Value)
  async getInventoryValue(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/items", {
      params: {
        start,
        limit,
        type: "product",
        order_direction: "DESC",
      },
    });
    return response.data;
  }

  // Ajustes de inventario (Inventory Adjustments)
  async getInventoryAdjustments(
    params: PaginationParams = {}
  ): Promise<unknown> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/inventory-adjustments", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Almacenes (Warehouses)
  async getWarehouses(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/warehouses", {
      params: {
        start,
        limit,
      },
    });
    return response.data;
  }

  // Factura proveedores (Purchase Invoices / Bills)
  async getPurchaseInvoices(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/bills", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Pagos/Gastos (Payments/Expenses)
  async getExpenses(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/bill-payments", {
      params: {
        start,
        limit,
        order_direction: "DESC",
        order_field: "date",
      },
    });
    return response.data;
  }

  // Bancos y cajas (Banks and Cash Registers)
  async getBankAccounts(params: PaginationParams = {}): Promise<any> {
    const { start, limit } = this.buildPaginationParams(params);
    const response = await this.client.get("/bank-accounts", {
      params: {
        start,
        limit,
      },
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