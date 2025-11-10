# Quick Start Guide

Get your Up Banking MCP server running in 5 minutes!

## Step 1: Get Your Up API Token (2 minutes)

1. Open the **Up app** on your phone
2. **Swipe right** to open settings
3. Select **"Data sharing"**
4. Tap **"Personal Access Token"**
5. Tap **"Generate a token"**
6. Choose token duration (30 days recommended for testing)
7. **Copy your token** and save it securely

⚠️ **Important**: This token gives full read access to your banking data. Keep it secure!

## Step 2: Install & Build (1 minute)

```bash
# Navigate to the server directory
cd up-mcp-server

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Step 3: Test Your Connection (1 minute)

Run the test script to verify everything works:

```bash
UP_API_TOKEN=your_token_here npx tsx test.ts
```

Replace `your_token_here` with your actual Up API token.

If successful, you'll see:
```
✅ Authentication successful!
✅ Found X account(s)
✅ Retrieved recent transactions
✅ All tests passed!
```

## Step 4: Configure Claude Desktop (1 minute)

### macOS
Open: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows  
Open: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration (update the paths):

```json
{
  "mcpServers": {
    "up-banking": {
      "command": "node",
      "args": ["/full/path/to/up-mcp-server/build/index.js"],
      "env": {
        "UP_API_TOKEN": "your_up_api_token_here"
      }
    }
  }
}
```

**Replace:**
- `/full/path/to/up-mcp-server` with your actual path
- `your_up_api_token_here` with your Up API token

### Finding Your Full Path

**macOS/Linux:**
```bash
cd up-mcp-server
pwd
```

**Windows:**
```cmd
cd up-mcp-server
cd
```

## Step 5: Restart Claude Desktop

Completely quit and reopen Claude Desktop for the changes to take effect.

## Step 6: Test It Out!

In Claude Desktop, try asking:

```
Can you ping the Up API to verify the connection?
```

If successful, try:

```
What's my current account balance?
```

```
Show me my last 5 transactions
```

## Troubleshooting

### "UP_API_TOKEN environment variable is required"
- Check your `claude_desktop_config.json` syntax
- Make sure the token is in the `env` section
- Verify there are no typos in the token

### "Module not found" or "Cannot find module"
- Make sure you ran `npm run build`
- Check that the path in the config is absolute, not relative
- Verify the path ends with `/build/index.js`

### "Up API error: 401"
- Your token is invalid or expired
- Generate a new token in the Up app
- Make sure you copied the complete token

### Server doesn't appear in Claude
- Verify JSON syntax in config (use a JSON validator)
- Restart Claude Desktop completely (quit, don't just close)
- Check the path is absolute and correct
- Look at Claude's logs for errors

### Where are Claude's logs?

**macOS:**
```
~/Library/Logs/Claude/
```

**Windows:**
```
%APPDATA%\Claude\logs\
```

## Next Steps

Check out [EXAMPLES.md](./EXAMPLES.md) for common queries and usage patterns!

## Security Reminder

- Never commit your API token to git
- Set an expiration date on your tokens
- You can revoke tokens anytime in the Up app
- This server only has READ access - it cannot make transfers

## Need Help?

Common issues:
1. Path must be absolute (start with `/` on Mac/Linux or `C:\` on Windows)
2. Must run `npm run build` before using
3. Must completely restart Claude Desktop after config changes
4. Token must be valid and not expired

If you're still stuck, check that:
- Node.js version is 18 or higher: `node --version`
- TypeScript compiled successfully (check `build/` directory exists)
- Config file has valid JSON syntax
