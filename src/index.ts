import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
// import { ModelContextProtocol } from "@modelcontextprotocol/sdk";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AlegraClient } from "./services/AlegraClient.ts";
import {safeParseResponseToOriginalInvoice, parseInvoices } from "./helpers/InvoiceParser.ts";
import type{ OriginalInvoice } from "./models/invoice/OriginalInvoice.ts";


let alegraClient: AlegraClient = null as any;

const keyVaultUrl = 'https://vaultferrequick.vault.azure.net/';
const azureCredentials = new DefaultAzureCredential();
const keyVaultClient = new SecretClient(keyVaultUrl, azureCredentials);

async function getCredentials() {
  const apiKey = await keyVaultClient.getSecret('ALEGRA-API-KEY');
  const user = await keyVaultClient.getSecret('ALEGRA-USER');
  return { 
      apiKey: apiKey.value||"",
      user: user.value || ""
    };
}


const getServer = (): McpServer => {
      const server = new McpServer({
        name: "Alegra MCP Server",
        version: "1.0.0",
    });

    server.tool(
      "get_invoices",
      "Retrieve invoices from Alegra POS with pagination. Returns newest invoices first.",
  {
    page: z.number().min(1).default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z.number().min(1).max(30).default(30)
      .describe("Number of invoices per page (default: 30, max: 30)"),
    order_direction: z.enum(["ASC", "DESC"]).optional()
      .describe("Sort order: ASC (ascending) or DESC (descending). Default: DESC"),
    order_field: z.enum(["id", "name", "date", "dueDate", "status"]).optional()
      .describe("Field to sort by: id, name, date, dueDate, or status. Default: date"),
    id: z.string().optional()
      .describe("Comma-separated invoice IDs (max 30). If specified, other parameters are ignored. Example: '123,456,789'"),
    date: z.string().optional()
      .describe("Filter by exact creation date. Format: YYYY-MM-DD. Example: '2024-01-15'"),
    dueDate: z.string().optional()
      .describe("Filter by exact due date. Format: YYYY-MM-DD. Example: '2024-02-15'"),
    status: z.string().optional()
      .describe("Filter by status. Comma-separated for multiple: 'open', 'closed', 'draft', 'void'. Example: 'open,draft'"),
    client_id: z.string().optional()
      .describe("Filter by client ID. Returns invoices for this specific client."),
    client_name: z.string().optional()
      .describe("Filter by client name. Returns invoices where client name contains this value."),
    client_identification: z.string().optional()
      .describe("Filter by client identification number. Returns invoices for clients with this identification."),
    item_id: z.string().optional()
      .describe("Filter by item ID. Returns invoices containing this specific item."),
    date_after: z.string().optional()
      .describe("Filter invoices created after this date (exclusive). Format: YYYY-MM-DD. Example: '2024-01-01'"),
    date_afterOrNow: z.string().optional()
      .describe("Filter invoices created from today onwards. Format: YYYY-MM-DD. Example: '2024-01-01'"),
    date_before: z.string().optional()
      .describe("Filter invoices created before this date (exclusive). Format: YYYY-MM-DD. Example: '2024-12-31'"),
    date_beforeOrNow: z.string().optional()
      .describe("Filter invoices created up to today. Format: YYYY-MM-DD. Example: '2024-12-31'"),
    dueDate_after: z.string().optional()
      .describe("Filter invoices with due date after this date (exclusive). Format: YYYY-MM-DD. Example: '2024-01-01'"),
    dueDate_afterOrNow: z.string().optional()
      .describe("Filter invoices with due date from today onwards. Format: YYYY-MM-DD. Example: '2024-01-01'"),
    dueDate_before: z.string().optional()
      .describe("Filter invoices with due date before this date (exclusive). Format: YYYY-MM-DD. Example: '2024-12-31'"),
    dueDate_beforeOrNow: z.string().optional()
      .describe("Filter invoices with due date up to today. Format: YYYY-MM-DD. Example: '2024-12-31'"),
  },
      async (params) => {

          const data = await alegraClient.getSalesInvoices(params);
          const originalInvoices:OriginalInvoice[]|null = safeParseResponseToOriginalInvoice(data);
          if(!originalInvoices){
            return {
              content: [
                  {
                      type: 'text',
                      text: "Failed to parse invoices from Alegra response"
                  }
              ]
            }
          }

          const simplifiedInvoices = parseInvoices(originalInvoices);

          return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(simplifiedInvoices, null, 2)
                }
            ]
          }
        }
    )

    server.tool(
      'get_payment_received',
      'Retrieve payment received information from Alegra POS with advanced filtering and pagination. Returns newest payments first by default.',
      {
        page: z.number().min(1).default(1)
          .describe("Page number for pagination (default: 1)"),
        limit: z.number().min(1).max(30).default(30)
          .describe("Number of payments per page (default: 30, max: 30)"),
        order_direction: z.enum(["ASC", "DESC"]).optional()
          .describe("Sort order: ASC (ascending) or DESC (descending). Default: ASC (ascending)"),
        order_field: z.enum(["id", "number", "date", "type"]).optional()
          .describe("Field to sort by: id, number, date, or type. Default: date"),
        type: z.enum(["in", "out"]).optional()
          .describe("Filter payments by income or expenses. Use 'in' for income, 'out' for expenses."),
        id: z.string().optional()
          .describe("Comma-separated payment IDs (max 30). If specified, other parameters are ignored. Example: '123,456,789'"),
        client_id: z.string().optional()
          .describe("Filter income and/or expenses by client ID."),
        conciliation_id: z.string().optional()
          .describe("Conciliation ID. Allows retrieving payments associated with a conciliation."),
      },
      async (params) => {
        const payment = await alegraClient.getPaymentsReceived(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payment, null, 2),
            },
          ],
        };
      }
    )

    // Tool definition for purchase invoices
server.tool(
  'get_purchase_invoices',
  'Retrieve purchase invoices (bills) from Alegra POS with advanced filtering and pagination. Returns newest invoices first by default.',
  {
    page: z.number().min(1).default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z.number().min(1).max(30).default(30)
      .describe("Number of purchase invoices per page (default: 30, max: 30)"),
    order_direction: z.enum(["ASC", "DESC"]).optional()
      .describe("Sort order: ASC (ascending) or DESC (descending). Default: ASC (ascending)"),
    order_field: z.enum(["date", "name", "dueDate"]).optional()
      .describe("Field to sort by: date, name, or dueDate. Default: date"),
    billNumber: z.string().optional()
      .describe("Filter by purchase invoice number. Returns invoices where the number matches totally or partially."),
    client_name: z.string().optional()
      .describe("Filter by client name. Returns purchase invoices where client name matches totally or partially."),
    date: z.string().optional()
      .describe("Filter by exact creation date. Format: YYYY-MM-DD. Example: '2024-01-15'"),
    dueDate: z.string().optional()
      .describe("Filter by exact due date. Format: YYYY-MM-DD. Example: '2024-02-15'"),
    status: z.string().optional()
      .describe("Filter by status. Options: 'open', 'closed', 'void'. Use comma-separated for multiple."),
    item_id: z.string().optional()
      .describe("Filter purchase invoices by item ID."),
    client_id: z.string().optional()
      .describe("Filter purchase invoices by client (supplier) ID."),
    provider_name: z.string().optional()
      .describe("Filter by provider name. Returns invoices where provider name matches totally or partially."),
    purchaseOrder_id: z.string().optional()
      .describe("Filter purchase invoices by purchase order ID."),
    type: z.enum(["bill", "supportDocument", "all"]).optional()
      .describe("Filter by document type. Options: 'bill' (purchase invoices), 'supportDocument' (support documents), 'all' (both types). Default: bill"),
  },
  async (params) => {
    const purchaseInvoices = await alegraClient.getPurchaseInvoices(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(purchaseInvoices, null, 2),
        },
      ],
    };
  }
)


// Tool definition for products and services
server.tool(
  'get_products_and_services',
  'Retrieve products and services from Alegra POS with advanced filtering and pagination. Returns items in ascending order by default.',
  {
    page: z.number().min(1).default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z.number().min(1).max(30).default(30)
      .describe("Number of items per page (default: 30, max: 30)"),
    order_direction: z.enum(["ASC", "DESC"]).optional()
      .describe("Sort order: ASC (ascending) or DESC (descending). Default: ASC (ascending)"),
    order_field: z.enum(["name", "id", "reference", "description"]).optional()
      .describe("Field to sort by: name, id, reference, or description. Default: name"),
    query: z.string().optional()
      .describe("Text string to search for products/services whose name or reference contains this text. Example: 'cuaderno'"),
    idWarehouse: z.string().optional()
      .describe("Warehouse/storage ID. If specified, only non-inventoriable products and inventoriable products in this warehouse are returned."),
    name: z.string().optional()
      .describe("Product or service name. Maximum length: 150 characters."),
    price: z.string().optional()
      .describe("Filter by price. Can be used to find items with specific pricing."),
    description: z.string().optional()
      .describe("Product or service description. Maximum length: 500 characters."),
    priceList_id: z.string().optional()
      .describe("Filter by price list ID."),
    idItemCategory: z.string().optional()
      .describe("Item category ID. If specified, only products associated with this category are returned."),
    type: z.enum(["simple", "kit"]).optional()
      .describe("Product type. Options: 'simple' or 'kit'"),
    status: z.enum(["active", "inactive"]).optional()
      .describe("Product or service status. Options: 'active' or 'inactive'. Note: An inactive product/service cannot be found; to edit it, send it with status 'active'."),
    inventariable: z.boolean().optional()
      .describe("Filter inventoriable items. Set to true to get only inventoriable items."),
    mode: z.enum(["advanced", "simple"]).optional()
      .describe("Response mode. 'simple' returns items excluding certain attributes. 'advanced' returns the item without excluding any attributes. Default: advanced"),
  },
  async (params) => {
    const items = await alegraClient.getProductsAndServices(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(items, null, 2),
        },
      ],
    };
  }
)


// Tool definition for inventory adjustments
server.tool(
  'get_inventory_adjustments',
  'Retrieve inventory adjustments from Alegra POS with advanced filtering and pagination. Returns newest adjustments first by default.',
  {
    page: z.number().min(1).default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z.number().min(1).max(30).default(30)
      .describe("Number of inventory adjustments per page (default: 30, max: 30)"),
    order_direction: z.enum(["ASC", "DESC"]).optional()
      .describe("Sort order: ASC (ascending) or DESC (descending). Default: ASC (ascending)"),
    order_field: z.enum(["id", "number", "date", "observations", "warehouse_name"]).optional()
      .describe("Field to sort by: id, number, date, observations, warehouse_name. Default: date"),
    number: z.number().int().optional()
      .describe("Filter by adjustment ID number."),
    date: z.string().optional()
      .describe("Filter adjustments by date. Format: YYYY-MM-DD. Example: '2024-01-15'"),
    warehouse_id: z.string().optional()
      .describe("Filter adjustments by warehouse ID."),
  },
  async (params) => {
    const adjustments = await alegraClient.getInventoryAdjustments(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(adjustments, null, 2),
        },
      ],
    };
  }
)



// Tool definition for warehouses
server.tool(
  'get_warehouses',
  'Retrieve warehouses from Alegra POS with advanced filtering and pagination.',
  {
    page: z.number().min(1).default(1)
      .describe("Page number for pagination (default: 1)"),
    limit: z.number().min(1).max(30).default(30)
      .describe("Number of warehouses per page (default: 30, max: 30)"),
    order_direction: z.enum(["ASC", "DESC"]).optional()
      .describe("Sort order: ASC (ascending) or DESC (descending). Default: ASC (ascending)"),
    order_field: z.string().optional()
      .describe("Field to sort by."),
    name: z.string().optional()
      .describe("Filter by warehouse name."),
    status: z.enum(["active", "inactive"]).optional()
      .describe("Filter by warehouse status. Options: 'active' or 'inactive'."),
  },
  async (params) => {
    const warehouses = await alegraClient.getWarehouses(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(warehouses, null, 2),
        },
      ],
    };
  }
)


    return server;
    
}

const main = async () => {
    const transport = new StdioServerTransport();
    const creds = await getCredentials();
    console.log("Retrieved credentials:", creds);
    alegraClient = new AlegraClient({
        username: creds.user,
        apiToken: creds.apiKey,
    });
    await getServer().connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
});