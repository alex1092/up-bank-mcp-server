# Up Banking MCP Server

A Model Context Protocol (MCP) server that provides integration with the [Up Banking API](https://developer.up.com.au/). This server allows Claude to interact with your Up banking data, including accounts, transactions, and categories.

<a href="https://glama.ai/mcp/servers/@alex1092/up-bank-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@alex1092/up-bank-mcp-server/badge" alt="Up Banking Server MCP server" />
</a>

## Features

- **Account Management**: List all accounts, get account details and balances
- **Transaction History**: Query transactions with flexible filtering (date range, status, category, tags)
- **Category Information**: Access Up's spending categories for better transaction insights
- **Type-Safe**: Built with TypeScript for reliability and developer experience
- **Secure**: Uses Up's personal access token for authentication

## Prerequisites

- Node.js 18 or higher
- An Up bank account
- Up personal access token

## Installation

1. Clone or download this repository:
```bash
cd up-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Getting Your Up API Token

1. Open the Up app on your phone
2. Swipe right and select "Data sharing"
3. Tap on 'Personal Access Token'
4. Select 'Generate a token'
5. Choose how long you want the token to last
6. Follow the prompts and copy your token securely

**Important**: Keep your token secure! Never share it or commit it to version control.

## Configuration

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "up-banking": {
      "command": "node",
      "args": ["/absolute/path/to/up-mcp-server/build/index.js"],
      "env": {
        "UP_API_TOKEN": "your_up_api_token_here"
      }
    }
  }
}
```

Replace `/absolute/path/to/up-mcp-server` with the actual path to this directory, and replace `your_up_api_token_here` with your Up personal access token.

### Alternative: Using npx

You can also run the server directly with npx:

```json
{
  "mcpServers": {
    "up-banking": {
      "command": "npx",
      "args": ["-y", "/absolute/path/to/up-mcp-server"],
      "env": {
        "UP_API_TOKEN": "your_up_api_token_here"
      }
    }
  }
}
```

## Available Tools

### `up_ping`
Test the API connection and verify authentication is working.

### `up_list_accounts`
List all accounts with optional filtering by account type or ownership.

**Parameters:**
- `accountType` (optional): Filter by "SAVER", "TRANSACTIONAL", or "HOME_LOAN"
- `ownershipType` (optional): Filter by "INDIVIDUAL" or "JOINT"

### `up_get_account`
Get detailed information about a specific account.

**Parameters:**
- `accountId` (required): The account ID

### `up_list_transactions`
List transactions with comprehensive filtering options.

**Parameters:**
- `accountId` (optional): Filter to a specific account
- `status` (optional): "HELD" (pending) or "SETTLED"
- `since` (optional): Start date in RFC 3339 format (e.g., "2024-01-01T00:00:00+10:00")
- `until` (optional): End date in RFC 3339 format
- `category` (optional): Category ID (e.g., "restaurants-and-cafes")
- `tag` (optional): Transaction tag
- `pageSize` (optional): Number of results (1-100)

### `up_get_transaction`
Get detailed information about a specific transaction.

**Parameters:**
- `transactionId` (required): The transaction ID

### `up_list_categories`
List all spending categories in Up.

**Parameters:**
- `parentId` (optional): Filter to children of a specific parent category

### `up_get_category`
Get details about a specific category.

**Parameters:**
- `categoryId` (required): The category ID (e.g., "restaurants-and-cafes")

## Usage Examples

Once configured, you can ask Claude questions like:

- "What's my current account balance?"
- "Show me all transactions from last month"
- "How much did I spend on restaurants this week?"
- "List all my saver accounts"
- "What are the pending transactions in my spending account?"
- "Show me all transactions tagged with 'vacation'"

## Development

### Watch Mode
For development with automatic recompilation:
```bash
npm run dev
```

### Testing the Connection
After configuration, restart Claude Desktop and try:
```
Can you ping the Up API to verify the connection?
```

## Troubleshooting

### "UP_API_TOKEN environment variable is required"
Make sure you've added your Up API token to the `env` section of your Claude Desktop config.

### "Up API error: 401"
Your API token is invalid or expired. Generate a new token in the Up app.

### Server not appearing in Claude
1. Check that the path to `build/index.js` is absolute and correct
2. Verify the JSON syntax in your config file is valid
3. Restart Claude Desktop completely
4. Check Claude's logs for error messages

## Security Notes

- Your Up API token grants full read access to your banking data
- Never commit your token to version control
- Use environment variables or secure configuration management
- Token access can be revoked anytime in the Up app
- Consider setting an expiration date for your tokens

## API Rate Limits

The Up API has rate limits. The server will return error messages if limits are exceeded. Use pagination and filtering to minimize API calls.

## Contributing

This is a basic implementation covering the main read operations. Potential enhancements:

- Add webhook support for real-time transaction notifications
- Implement transaction categorization updates
- Add attachment/receipt support
- Support for pagination with cursor-based browsing

## License

MIT

## Related Links

- [Up Banking API Documentation](https://developer.up.com.au/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Up Bank](https://up.com.au/)