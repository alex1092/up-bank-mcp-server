# Up Banking MCP Server - Project Overview

## What is This?

This is a **Model Context Protocol (MCP)** server that connects the Up Banking API to Claude Desktop, allowing you to have natural conversations with Claude about your banking data.

## Architecture

```
┌─────────────────┐
│  Claude Desktop │
│                 │
└────────┬────────┘
         │ MCP Protocol (stdio)
         │
┌────────▼────────┐
│   MCP Server    │
│   (Node.js)     │
│                 │
│  - Implements   │
│    MCP tools    │
│  - Handles      │
│    requests     │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│  Up Banking API │
│                 │
│ api.up.com.au   │
└─────────────────┘
```

## Project Structure

```
up-mcp-server/
├── src/
│   └── index.ts              # Main server implementation
├── build/                     # Compiled JavaScript (generated)
├── node_modules/             # Dependencies (generated)
├── package.json              # Project config & dependencies
├── tsconfig.json             # TypeScript configuration
├── test.ts                   # Connection test script
├── .gitignore                # Git ignore rules
├── README.md                 # Main documentation
├── QUICKSTART.md             # Quick start guide
├── EXAMPLES.md               # Usage examples
└── claude_desktop_config.example.json  # Config template
```

## Key Components

### 1. MCP Server (`src/index.ts`)

The main server implementation that:
- Connects to Claude Desktop via stdio (Model Context Protocol)
- Exposes 7 tools for banking operations
- Makes authenticated requests to Up Banking API
- Returns structured JSON responses

### 2. Up API Client

TypeScript class that handles:
- HTTP requests to Up API
- Bearer token authentication
- Error handling
- Type-safe responses

### 3. Tool Definitions

Seven tools exposed to Claude:
1. `up_ping` - Test connection
2. `up_list_accounts` - List all accounts
3. `up_get_account` - Get account details
4. `up_list_transactions` - Query transactions
5. `up_get_transaction` - Get transaction details
6. `up_list_categories` - List spending categories
7. `up_get_category` - Get category details

## Data Flow

1. **User asks Claude a question** about their banking
   ```
   "What's my account balance?"
   ```

2. **Claude decides which tool(s) to use**
   ```javascript
   tool: "up_list_accounts"
   arguments: {}
   ```

3. **MCP Server receives the request**
   - Validates the tool and arguments
   - Calls the Up API client

4. **Up API Client makes HTTP request**
   ```
   GET https://api.up.com.au/api/v1/accounts
   Authorization: Bearer <token>
   ```

5. **Response flows back through the chain**
   ```
   Up API → Client → MCP Server → Claude → User
   ```

6. **Claude interprets the data** and responds naturally
   ```
   "You have $1,234.56 in your Spending account and 
    $5,678.90 in your Savings account."
   ```

## Security Model

### What's Secure
- ✅ Token stored in environment variable (not in code)
- ✅ Communication via local stdio (not network)
- ✅ Read-only API access (cannot make transfers)
- ✅ Token can be revoked anytime
- ✅ No data stored or logged by server

### What to Protect
- 🔒 Your Up API token (treat like a password)
- 🔒 The `claude_desktop_config.json` file
- 🔒 Never commit tokens to version control

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.7
- **MCP SDK**: @modelcontextprotocol/sdk ^1.0.4
- **Protocol**: Model Context Protocol (stdio transport)
- **API**: Up Banking REST API v1

## Limitations

### API Limitations
- **Read-only**: Cannot make transfers or payments
- **Rate limits**: Up API has rate limiting
- **No write operations**: Cannot categorize or tag transactions
- **No webhooks**: Real-time updates not implemented

### Server Limitations
- **Single user**: One token per server instance
- **No persistence**: Stateless server (no caching)
- **No pagination browsing**: Returns first page only
- **Synchronous**: No parallel request handling

## Future Enhancements

Potential additions:
1. **Webhook Support**: Real-time transaction notifications
2. **Categorization**: Update transaction categories
3. **Pagination**: Browse through all pages of results
4. **Caching**: Reduce API calls with intelligent caching
5. **Attachments**: Access transaction receipts
6. **Multiple Accounts**: Support multiple Up accounts
7. **Analytics**: Built-in spending analysis tools

## Performance Considerations

- **Startup time**: ~100ms (server initialization)
- **Tool execution**: 200-500ms (API round-trip)
- **Memory usage**: ~30-50MB
- **API rate limits**: Respect Up's rate limiting

## Error Handling

The server handles:
- Invalid authentication (401 errors)
- Missing environment variables
- Invalid tool arguments
- Up API errors (4xx, 5xx)
- Network failures
- JSON parsing errors

All errors are returned to Claude with descriptive messages.

## Testing

### Local Testing
```bash
# Test API connection directly
UP_API_TOKEN=your_token npm test

# Or manually
UP_API_TOKEN=your_token npx tsx test.ts
```

### Integration Testing
Test through Claude Desktop by asking questions after configuration.

## Development Workflow

1. **Make changes** to `src/index.ts`
2. **Rebuild**: `npm run build`
3. **Restart Claude Desktop**
4. **Test** your changes

For active development:
```bash
# Watch mode (auto-rebuild)
npm run dev
```

## Debugging

### Server Logs
The server logs to stderr, which Claude captures:
- **macOS**: `~/Library/Logs/Claude/`
- **Windows**: `%APPDATA%\Claude\logs\`

### Common Issues
1. **Token errors**: Check token validity in Up app
2. **Path errors**: Ensure absolute paths in config
3. **Build errors**: Run `npm install` and `npm run build`
4. **Config errors**: Validate JSON syntax

## Compliance & Privacy

- **Data Privacy**: All data stays on your machine
- **PCI Compliance**: Read-only access, no payment data
- **Terms of Service**: Subject to Up's API terms
- **Rate Limiting**: Respects Up's API limits

## Contributing Guidelines

If extending this server:
1. Maintain TypeScript types
2. Add error handling
3. Update documentation
4. Test with real Up account
5. Follow MCP best practices

## Related Documentation

- [Up Banking API Docs](https://developer.up.com.au/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/)

## License

MIT License - Feel free to modify and extend!

## Support

For issues with:
- **This server**: Check the README and troubleshooting sections
- **Up API**: Contact Up support or check their API docs
- **Claude Desktop**: Check Anthropic's documentation
- **MCP Protocol**: See MCP specification

## Version History

- **1.0.0**: Initial release with core read operations
  - Account listing and details
  - Transaction queries with filtering
  - Category browsing
  - Connection testing

---

Built with ❤️ for the Up Banking community in Australia 🇦🇺
