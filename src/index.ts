#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

interface UpApiConfig {
  apiToken: string;
  baseUrl: string;
}

interface MoneyObject {
  currencyCode: string;
  value: string;
  valueInBaseUnits: number;
}

interface AccountResource {
  type: "accounts";
  id: string;
  attributes: {
    displayName: string;
    accountType: "SAVER" | "TRANSACTIONAL" | "HOME_LOAN";
    ownershipType: "INDIVIDUAL" | "JOINT";
    balance: MoneyObject;
    createdAt: string;
  };
  relationships: {
    transactions: {
      links: {
        related: string;
      };
    };
  };
  links: {
    self: string;
  };
}

interface TransactionResource {
  type: "transactions";
  id: string;
  attributes: {
    status: "HELD" | "SETTLED";
    rawText: string | null;
    description: string;
    message: string | null;
    isCategorizable: boolean;
    amount: MoneyObject;
    foreignAmount: MoneyObject | null;
    settledAt: string | null;
    createdAt: string;
    transactionType: string | null;
  };
  relationships: {
    account: {
      data: {
        type: "accounts";
        id: string;
      };
    };
    category: {
      data: {
        type: "categories";
        id: string;
      } | null;
    };
  };
}

interface CategoryResource {
  type: "categories";
  id: string;
  attributes: {
    name: string;
  };
  relationships: {
    parent: {
      data: {
        type: "categories";
        id: string;
      } | null;
    };
    children: {
      data: Array<{
        type: "categories";
        id: string;
      }>;
    };
  };
}

class UpApiClient {
  constructor(private config: UpApiConfig) {}

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Up API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json();
  }

  async ping(): Promise<{ meta: { id: string; statusEmoji: string } }> {
    return this.makeRequest("/util/ping");
  }

  async listAccounts(filters?: {
    accountType?: "SAVER" | "TRANSACTIONAL" | "HOME_LOAN";
    ownershipType?: "INDIVIDUAL" | "JOINT";
  }): Promise<{ data: AccountResource[] }> {
    let endpoint = "/accounts";
    const params = new URLSearchParams();

    if (filters?.accountType) {
      params.append("filter[accountType]", filters.accountType);
    }
    if (filters?.ownershipType) {
      params.append("filter[ownershipType]", filters.ownershipType);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeRequest(endpoint);
  }

  async getAccount(accountId: string): Promise<{ data: AccountResource }> {
    return this.makeRequest(`/accounts/${accountId}`);
  }

  async listTransactions(filters?: {
    accountId?: string;
    status?: "HELD" | "SETTLED";
    since?: string;
    until?: string;
    category?: string;
    tag?: string;
    pageSize?: number;
  }): Promise<{ data: TransactionResource[] }> {
    let endpoint = filters?.accountId
      ? `/accounts/${filters.accountId}/transactions`
      : "/transactions";

    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("filter[status]", filters.status);
    }
    if (filters?.since) {
      params.append("filter[since]", filters.since);
    }
    if (filters?.until) {
      params.append("filter[until]", filters.until);
    }
    if (filters?.category) {
      params.append("filter[category]", filters.category);
    }
    if (filters?.tag) {
      params.append("filter[tag]", filters.tag);
    }
    if (filters?.pageSize) {
      params.append("page[size]", filters.pageSize.toString());
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeRequest(endpoint);
  }

  async getTransaction(
    transactionId: string
  ): Promise<{ data: TransactionResource }> {
    return this.makeRequest(`/transactions/${transactionId}`);
  }

  async listCategories(filters?: {
    parentId?: string;
  }): Promise<{ data: CategoryResource[] }> {
    let endpoint = "/categories";
    const params = new URLSearchParams();

    if (filters?.parentId) {
      params.append("filter[parent]", filters.parentId);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeRequest(endpoint);
  }

  async getCategory(categoryId: string): Promise<{ data: CategoryResource }> {
    return this.makeRequest(`/categories/${categoryId}`);
  }
}

const TOOLS: Tool[] = [
  {
    name: "up_ping",
    description:
      "Test the Up API connection and verify authentication is working",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "up_list_accounts",
    description:
      "List all accounts for the authenticated user. Returns account balances, types (SAVER, TRANSACTIONAL, HOME_LOAN), and ownership information.",
    inputSchema: {
      type: "object",
      properties: {
        accountType: {
          type: "string",
          enum: ["SAVER", "TRANSACTIONAL", "HOME_LOAN"],
          description: "Filter by account type",
        },
        ownershipType: {
          type: "string",
          enum: ["INDIVIDUAL", "JOINT"],
          description: "Filter by ownership type",
        },
      },
    },
  },
  {
    name: "up_get_account",
    description:
      "Get details for a specific account by ID, including current balance and account information.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: {
          type: "string",
          description: "The unique identifier for the account",
        },
      },
      required: ["accountId"],
    },
  },
  {
    name: "up_list_transactions",
    description:
      "List transactions across all accounts or for a specific account. Supports filtering by status, date range, category, and tags. Returns paginated results ordered newest first.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: {
          type: "string",
          description: "Optional: Filter to transactions for a specific account",
        },
        status: {
          type: "string",
          enum: ["HELD", "SETTLED"],
          description: "Filter by transaction status (pending or settled)",
        },
        since: {
          type: "string",
          description:
            "Start date-time in RFC 3339 format (e.g., 2024-01-01T00:00:00+10:00)",
        },
        until: {
          type: "string",
          description:
            "End date-time in RFC 3339 format (e.g., 2024-12-31T23:59:59+10:00)",
        },
        category: {
          type: "string",
          description:
            "Filter by category ID (e.g., 'restaurants-and-cafes', 'good-life')",
        },
        tag: {
          type: "string",
          description: "Filter by transaction tag",
        },
        pageSize: {
          type: "number",
          description: "Number of records to return (default: 30, max: 100)",
        },
      },
    },
  },
  {
    name: "up_get_transaction",
    description:
      "Get detailed information about a specific transaction by ID, including amount, description, category, and related account.",
    inputSchema: {
      type: "object",
      properties: {
        transactionId: {
          type: "string",
          description: "The unique identifier for the transaction",
        },
      },
      required: ["transactionId"],
    },
  },
  {
    name: "up_list_categories",
    description:
      "List all spending categories in Up. Categories have a parent-child relationship. Use this to understand category IDs for filtering transactions.",
    inputSchema: {
      type: "object",
      properties: {
        parentId: {
          type: "string",
          description:
            "Optional: Filter to only show children of a specific parent category",
        },
      },
    },
  },
  {
    name: "up_get_category",
    description:
      "Get details about a specific category by ID, including its name and parent/child relationships.",
    inputSchema: {
      type: "object",
      properties: {
        categoryId: {
          type: "string",
          description:
            "The unique identifier for the category (e.g., 'restaurants-and-cafes')",
        },
      },
      required: ["categoryId"],
    },
  },
];

async function runServer() {
  const apiToken = process.env.UP_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "UP_API_TOKEN environment variable is required. Get your token from the Up app: Data sharing > Personal Access Token"
    );
  }

  const config: UpApiConfig = {
    apiToken,
    baseUrl: "https://api.up.com.au/api/v1",
  };

  const client = new UpApiClient(config);
  const server = new Server(
    {
      name: "up-banking-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case "up_ping": {
          const result = await client.ping();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_list_accounts": {
          const args = request.params.arguments as {
            accountType?: "SAVER" | "TRANSACTIONAL" | "HOME_LOAN";
            ownershipType?: "INDIVIDUAL" | "JOINT";
          };
          const result = await client.listAccounts(args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_get_account": {
          const args = request.params.arguments as { accountId: string };
          const result = await client.getAccount(args.accountId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_list_transactions": {
          const args = request.params.arguments as {
            accountId?: string;
            status?: "HELD" | "SETTLED";
            since?: string;
            until?: string;
            category?: string;
            tag?: string;
            pageSize?: number;
          };
          const result = await client.listTransactions(args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_get_transaction": {
          const args = request.params.arguments as { transactionId: string };
          const result = await client.getTransaction(args.transactionId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_list_categories": {
          const args = request.params.arguments as { parentId?: string };
          const result = await client.listCategories(args);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "up_get_category": {
          const args = request.params.arguments as { categoryId: string };
          const result = await client.getCategory(args.categoryId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Up Banking MCP server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
