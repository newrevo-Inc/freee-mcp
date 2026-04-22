import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInventoryAuthUrl, exchangeInventoryCodeForTokens } from './oauth.js';

vi.mock('./config.js', () => ({
  INVENTORY_AUTHORIZATION_ENDPOINT: 'https://logikura.com/oauth/authorize',
  INVENTORY_TOKEN_ENDPOINT: 'https://logikura.com/oauth/token',
  INVENTORY_OAUTH_SCOPE: 'read write',
  getInventoryCredentials: (): Promise<{
    clientId: string;
    clientSecret: string;
    callbackPort: number;
  }> =>
    Promise.resolve({
      clientId: 'inv-client',
      clientSecret: 'inv-secret',
      callbackPort: 54323,
    }),
}));

vi.mock('./tokens.js', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, saveInventoryTokens: vi.fn() };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('inventory/oauth', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('buildInventoryAuthUrl は scope=read write を含む URL を生成する', () => {
    const url = buildInventoryAuthUrl('st', 'http://127.0.0.1:54323/callback', 'inv-client');
    expect(url).toContain('https://logikura.com/oauth/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=inv-client');
    expect(url).toMatch(/scope=read(\+|%20)write/);
    expect(url).toContain('state=st');
    expect(url).not.toContain('code_challenge');
  });

  it('exchangeInventoryCodeForTokens が token endpoint に POST する', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'at',
          refresh_token: 'rt',
          expires_in: 7200,
          token_type: 'Bearer',
        }),
    });
    const result = await exchangeInventoryCodeForTokens('code', 'http://127.0.0.1:54323/callback');
    const call = mockFetch.mock.calls[0];
    const body = call[1].body as URLSearchParams;
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('client_id')).toBe('inv-client');
    expect(body.get('client_secret')).toBe('inv-secret');
    expect(result.access_token).toBe('at');
    expect(result.scope).toBe('read write');
  });

  it('401 → Token exchange failed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'invalid_client' }),
    });
    await expect(
      exchangeInventoryCodeForTokens('code', 'http://127.0.0.1:54323/callback'),
    ).rejects.toThrow('Token exchange failed: 401');
  });

  it('User-Agent が freee-mcp プレフィックス', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'at', refresh_token: 'rt', expires_in: 7200 }),
    });
    await exchangeInventoryCodeForTokens('code', 'http://127.0.0.1:54323/callback');
    expect(mockFetch.mock.calls[0][1].headers['User-Agent']).toMatch(/^freee-mcp\//);
  });
});
