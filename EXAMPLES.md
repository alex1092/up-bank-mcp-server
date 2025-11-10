# Up Banking MCP Server - Usage Examples

This document provides examples of how to interact with your Up banking data through Claude once the MCP server is configured.

## Account Queries

### Check Account Balances
```
What's my current account balance?
```

```
Show me all my accounts and their balances
```

```
How much money is in my saver accounts?
```

### Account Details
```
What type of accounts do I have?
```

```
Tell me about my spending account
```

## Transaction Queries

### Recent Transactions
```
Show me my last 10 transactions
```

```
What were my recent purchases?
```

```
List all pending transactions
```

### Date-Based Queries
```
Show me all transactions from last month
```

```
What did I spend in the first week of November 2024?
```

```
List transactions between December 1st and December 15th, 2024
```

### Category-Based Analysis
```
How much did I spend on restaurants this month?
```

```
Show me all my "good-life" category transactions
```

```
What are my top spending categories?
```

```
How much have I spent on groceries in the last 30 days?
```

### Tag-Based Queries
```
Show me all transactions tagged with "vacation"
```

```
How much did I spend on my trip to Bali? (if tagged)
```

### Specific Transaction Details
```
Tell me more about transaction [transaction-id]
```

```
What's the status of my pending Spotify charge?
```

## Category Exploration

### List Categories
```
What spending categories does Up track?
```

```
Show me all the subcategories under "Good Life"
```

```
What categories are available for organizing transactions?
```

## Analysis & Insights

### Spending Analysis
```
Analyze my spending patterns for the last month
```

```
What percentage of my spending goes to restaurants vs groceries?
```

```
Compare my spending this month to last month
```

### Account Health
```
Give me a financial summary of my accounts
```

```
Am I spending more than I'm saving this month?
```

### Budget Tracking
```
I budgeted $500 for restaurants this month. How am I tracking?
```

```
How much have I transferred to savings this month?
```

## Advanced Queries

### Multi-Filter Queries
```
Show me all settled transactions over $100 from the last 2 weeks
```

```
List all pending restaurant transactions from this week
```

### Foreign Currency
```
Show me transactions that were made in foreign currency
```

```
How much did I spend overseas last month?
```

### Account-Specific
```
Show me only transactions from my spending account this month
```

```
What's the transaction history for my emergency fund saver?
```

## Practical Use Cases

### Monthly Review
```
Help me review my spending for November 2024. Break it down by category and highlight any unusual patterns.
```

### Budget Planning
```
Based on my transaction history, what should my monthly budget be for groceries, restaurants, and entertainment?
```

### Receipt Finding
```
Find my transaction at [merchant name] from last week - I need it for expense reporting
```

### Subscription Tracking
```
Can you identify all my recurring subscriptions from my transaction history?
```

### Financial Goals
```
I want to save $10,000 in 6 months. Based on my current spending and income patterns, is this realistic?
```

## Tips for Best Results

1. **Be Specific with Dates**: Use clear date ranges like "last month", "November 2024", or ISO format dates
2. **Use Category Names**: Refer to specific categories like "restaurants-and-cafes" or "good-life"
3. **Account Types**: Distinguish between "saver", "transactional", and "home loan" accounts
4. **Transaction Status**: Specify "pending" (HELD) or "settled" (SETTLED) when relevant
5. **Combine Filters**: You can filter by account, date range, category, and status simultaneously

## Date Format Notes

When asking for specific date ranges, you can use:
- Natural language: "last week", "this month", "yesterday"
- Month names: "November 2024", "December 1st to 15th"
- ISO format: "2024-11-01T00:00:00+10:00" (Melbourne time)

## Understanding Transaction Status

- **HELD**: Pending transactions that haven't settled yet (usually 1-3 days)
- **SETTLED**: Completed transactions that have been finalized

## Category Examples

Common Up categories you can filter by:
- `restaurants-and-cafes`
- `groceries`
- `transport`
- `entertainment`
- `personal`
- `home`
- `good-life` (parent category)
- `shopping`
- `bills-and-fees`

Use the `up_list_categories` tool to see all available categories!

## Privacy & Security

Remember:
- Claude only has READ access to your banking data
- Cannot make transfers or payments
- Cannot modify transactions
- All data stays local to your conversation
- Your API token can be revoked anytime in the Up app
