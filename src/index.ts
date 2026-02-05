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