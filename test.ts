#!/usr/bin/env node

/**
 * Test script for the Up Banking MCP Server
 * 
 * This script tests the server's connection to the Up API directly
 * (not through MCP protocol) to verify your token and API setup.
 * 
 * Usage:
 *   UP_API_TOKEN=your_token_here node test.js
 */

const BASE_URL = "https://api.up.com.au/api/v1";

async function makeRequest(endpoint: string, token: string): Promise<unknown> {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\nTesting: ${endpoint}`);
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return response.json();
}

async function runTests() {
  const apiToken = process.env.UP_API_TOKEN;
  
  if (!apiToken) {
    console.error("❌ Error: UP_API_TOKEN environment variable is required");
    console.error("\nUsage:");
    console.error("  UP_API_TOKEN=your_token_here node test.js");
    console.error("\nGet your token from the Up app:");
    console.error("  1. Swipe right → Data sharing");
    console.error("  2. Personal Access Token");
    console.error("  3. Generate a token");
    process.exit(1);
  }

  console.log("🔧 Testing Up Banking API Connection...\n");
  console.log("=" .repeat(50));

  try {
    // Test 1: Ping
    console.log("\n1️⃣  Testing Authentication (ping)");
    const pingResult = await makeRequest("/util/ping", apiToken);
    console.log("✅ Authentication successful!");
    console.log(JSON.stringify(pingResult, null, 2));

    // Test 2: List Accounts
    console.log("\n2️⃣  Fetching Accounts");
    const accountsResult = await makeRequest("/accounts", apiToken) as { data: Array<{ id: string; attributes: { displayName: string; accountType: string; balance: { value: string } } }> };
    console.log(`✅ Found ${accountsResult.data.length} account(s)`);
    
    accountsResult.data.forEach((account) => {
      console.log(
        `   - ${account.attributes.displayName} (${account.attributes.accountType}): $${account.attributes.balance.value}`
      );
    });

    // Test 3: List Recent Transactions
    if (accountsResult.data.length > 0) {
      console.log("\n3️⃣  Fetching Recent Transactions");
      const transactionsResult = await makeRequest(
        "/transactions?page[size]=5",
        apiToken
      ) as { data: Array<{ attributes: { description: string; amount: { value: string }; createdAt: string } }> };
      console.log(`✅ Retrieved ${transactionsResult.data.length} recent transaction(s)`);
      
      transactionsResult.data.forEach((txn, i) => {
        console.log(
          `   ${i + 1}. ${txn.attributes.description}: $${txn.attributes.amount.value} (${new Date(txn.attributes.createdAt).toLocaleDateString()})`
        );
      });
    }

    // Test 4: List Categories
    console.log("\n4️⃣  Fetching Categories");
    const categoriesResult = await makeRequest("/categories", apiToken) as { data: Array<{ id: string; attributes: { name: string } }> };
    console.log(`✅ Found ${categoriesResult.data.length} categories`);
    console.log(
      `   Sample: ${categoriesResult.data.slice(0, 5).map((c) => c.attributes.name).join(", ")}...`
    );

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests passed!");
    console.log("\nYour Up API token is working correctly.");
    console.log("You can now configure the MCP server in Claude Desktop.");
    console.log("\nNext steps:");
    console.log("1. Build the server: npm run build");
    console.log("2. Add configuration to Claude Desktop config");
    console.log("3. Restart Claude Desktop");
    console.log("4. Ask Claude to interact with your Up account!");
    
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error instanceof Error) {
      console.error(error.message);
      
      if (error.message.includes("401")) {
        console.error("\n💡 This usually means your API token is invalid or expired.");
        console.error("   Generate a new token in the Up app.");
      }
    }
    process.exit(1);
  }
}

runTests();
