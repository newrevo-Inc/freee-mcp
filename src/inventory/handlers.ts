import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PACKAGE_VERSION } from '../constants.js';
import { INVENTORY_SERVER_INSTRUCTIONS } from './config.js';
import { addInventoryApiTools, addInventoryAuthenticationTools } from './tools.js';

export function createInventoryMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'freee-inventory', version: PACKAGE_VERSION },
    { instructions: INVENTORY_SERVER_INSTRUCTIONS },
  );
  addInventoryAuthenticationTools(server);
  addInventoryApiTools(server);
  return server;
}

export async function createAndStartInventoryServer(): Promise<void> {
  const server = createInventoryMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Freee Inventory MCP Server running on stdio');
}
