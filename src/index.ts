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
      },
      async ({ page, limit }) => {

          const data = await alegraClient.getSalesInvoices({ page, limit });
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