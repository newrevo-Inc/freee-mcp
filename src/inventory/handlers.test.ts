import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInventoryMcpServer } from './handlers.js';
import { addInventoryAuthenticationTools } from './tools.js';

vi.mock('./config.js', () => ({
  INVENTORY_SERVER_INSTRUCTIONS: 'freee 在庫管理 APIと連携するMCPサーバー。',
  INVENTORY_API_URL: 'https://api.logikura.com',
  INVENTORY_AUTHORIZATION_ENDPOINT: 'https://logikura.com/oauth/authorize',
  INVENTORY_TOKEN_ENDPOINT: 'https://logikura.com/oauth/token',
  INVENTORY_OAUTH_SCOPE: 'read write',
  INVENTORY_API_PATH_REGEX: /^\/api\/v\d+\//,
  INVENTORY_PATH_TRAVERSAL_REGEX: /(\.\.|%2e%2e)/i,
  getInventoryCredentials: () =>
    Promise.resolve({ clientId: 'id', clientSecret: 'secret', callbackPort: 54323 }),
}));

vi.mock('./tokens.js', () => ({
  loadInventoryTokens: () => Promise.resolve(null),
  isInventoryTokenValid: () => false,
  clearInventoryTokens: () => Promise.resolve(),
  getValidInventoryAccessToken: () => Promise.resolve(null),
  OAuthTokenResponseSchema: { safeParse: vi.fn() },
  InventoryTokenDataSchema: { safeParse: vi.fn() },
}));

vi.mock('../auth/server.js', () => ({
  startCallbackServerWithAutoStop: () => Promise.resolve(),
  getActualRedirectUri: () => 'http://127.0.0.1:54323/callback',
  getDefaultAuthManager: () => ({
    registerCliAuthHandler: vi.fn(),
    removeCliAuthHandler: vi.fn(),
  }),
}));

describe('inventory/handlers', () => {
  it('createInventoryMcpServer が server を返す', () => {
    const server = createInventoryMcpServer();
    expect(server).toBeDefined();
  });

  it('INVENTORY_SERVER_INSTRUCTIONS が在庫管理ドメイン固有の説明文', async () => {
    const { INVENTORY_SERVER_INSTRUCTIONS } = await import('./config.js');
    expect(INVENTORY_SERVER_INSTRUCTIONS).toContain('在庫');
    expect(INVENTORY_SERVER_INSTRUCTIONS).not.toContain('会計');
  });

  describe('ツール登録', () => {
    let mockServer: McpServer;
    let mockTool: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockTool = vi.fn();
      mockServer = { registerTool: mockTool } as unknown as McpServer;
      vi.clearAllMocks();
    });

    it('inventory_authenticate / auth_status / clear_auth / server_info が登録される', () => {
      addInventoryAuthenticationTools(mockServer);
      const names = mockTool.mock.calls.map((c: unknown[]) => c[0]);
      expect(names).toContain('inventory_authenticate');
      expect(names).toContain('inventory_auth_status');
      expect(names).toContain('inventory_clear_auth');
      expect(names).toContain('inventory_server_info');
    });

    it('inventory_server_info が stdio transport を返す', async () => {
      addInventoryAuthenticationTools(mockServer);
      const handler = mockTool.mock.calls.find(
        (c: unknown[]) => c[0] === 'inventory_server_info',
      )?.[2];
      const result = await handler();
      expect(result.content[0].text).toContain('freee-inventory-mcp');
      expect(result.content[0].text).toContain('transport: stdio');
    });
  });
});
