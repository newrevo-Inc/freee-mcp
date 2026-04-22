import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeInventoryApiRequest } from './client.js';

vi.mock('./tokens.js', () => ({ getValidInventoryAccessToken: vi.fn() }));
vi.mock('./config.js', () => ({
  INVENTORY_API_URL: 'https://api.logikura.com',
  INVENTORY_API_PATH_REGEX: /^\/api\/v\d+\//,
  INVENTORY_PATH_TRAVERSAL_REGEX: /(\.\.|%2e%2e)/i,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('inventory/client', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('正常系', () => {
    it('GET が Bearer トークン + User-Agent で送信される', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('test-token');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify({ warehouses: [] })),
      });
      const result = await makeInventoryApiRequest('GET', '/api/v1/warehouses');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.logikura.com/api/v1/warehouses',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'User-Agent': expect.stringMatching(/^freee-mcp\//),
          }),
        }),
      );
      expect(result).toEqual({ warehouses: [] });
    });

    it('API バージョン v2 のパスも通る', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{}'),
      });
      await expect(makeInventoryApiRequest('GET', '/api/v2/products')).resolves.toBeDefined();
    });

    it('POST body が JSON で送られる', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });
      await makeInventoryApiRequest('POST', '/api/v1/products', undefined, { name: 'x' });
      expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify({ name: 'x' }));
    });

    it('204 → null', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({ ok: true, status: 204, headers: new Headers() });
      expect(await makeInventoryApiRequest('DELETE', '/api/v1/products/1')).toBeNull();
    });
  });

  describe('異常系', () => {
    it('未認証 → inventory_authenticate 誘導', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue(null);
      await expect(makeInventoryApiRequest('GET', '/api/v1/warehouses')).rejects.toThrow(
        'inventory_authenticate',
      );
    });

    it('401 → 再認証誘導', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'unauthorized' }),
      });
      await expect(makeInventoryApiRequest('GET', '/api/v1/warehouses')).rejects.toThrow(
        'inventory_authenticate',
      );
    });

    it('422 → エラー詳細が含まれる（Logikura は {error: string} 形式）', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ error: '不正なパラメーター' }),
      });
      await expect(
        makeInventoryApiRequest('POST', '/api/v1/products', undefined, {}),
      ).rejects.toThrow(/422.*不正なパラメーター/);
    });
  });

  describe('パス validation', () => {
    it('絶対 URL / protocol-relative / 先頭スラッシュ無しは拒否', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      await expect(
        makeInventoryApiRequest('GET', 'https://attacker.example.com/leak'),
      ).rejects.toThrow('Invalid Inventory API path');
      await expect(makeInventoryApiRequest('GET', '//attacker.example.com/leak')).rejects.toThrow(
        'Invalid Inventory API path',
      );
      await expect(makeInventoryApiRequest('GET', 'api/v1/warehouses')).rejects.toThrow(
        'Invalid Inventory API path',
      );
    });

    it('path traversal (.. / %2e%2e) は拒否', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      await expect(makeInventoryApiRequest('GET', '/api/v1/../../admin/secret')).rejects.toThrow(
        '/api/v',
      );
      await expect(makeInventoryApiRequest('GET', '/api/v1/%2e%2e/admin')).rejects.toThrow(
        '/api/v',
      );
    });

    it('/oauth/token 等 /api/v{n}/ 外のパスは拒否', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      await expect(makeInventoryApiRequest('GET', '/oauth/token')).rejects.toThrow(
        'Invalid Inventory API path',
      );
    });
  });

  describe('レートリミット (429/499 両対応)', () => {
    it('429 Too Many Requests (実装実挙動) → X-Rate-Limit-Reset を含むメッセージ', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ 'X-Rate-Limit-Reset': '30', 'X-RateLimit-Limit': '100' }),
        json: () => Promise.resolve({ error: 'リクエスト数の上限に達しました' }),
      });
      await expect(makeInventoryApiRequest('GET', '/api/v1/warehouses')).rejects.toThrow(
        /429.*30秒後/,
      );
    });

    it('499 Too Many Requests (OpenAPI 仕様) → X-Rate-Limit-Reset を含むメッセージ', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 499,
        headers: new Headers({ 'X-Rate-Limit-Reset': '30', 'X-RateLimit-Limit': '100' }),
        json: () => Promise.resolve({ error: 'rate_limited' }),
      });
      await expect(makeInventoryApiRequest('GET', '/api/v1/warehouses')).rejects.toThrow(
        /499|レートリミット/,
      );
    });
  });

  describe('telemetry query_keys', () => {
    it('クエリキー名のみが記録され値は流出しない', async () => {
      const { getValidInventoryAccessToken } = await import('./tokens.js');
      vi.mocked(getValidInventoryAccessToken).mockResolvedValue('t');
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('[]'),
      });
      const { RequestRecorder, withRequestRecorder } = await import('../server/request-context.js');
      const recorder = new RequestRecorder({
        request_id: 'req-inv',
        source_ip: '127.0.0.1',
        method: 'POST',
        path: '/mcp',
      });
      await withRequestRecorder(recorder, () =>
        makeInventoryApiRequest('GET', '/api/v1/products', { page: 1, per: 50 }),
      );
      const payload = recorder.buildPayload({ status: 200, duration_ms: 1 });
      const apiCalls = payload.api.calls as Array<Record<string, unknown>>;
      expect(apiCalls[0]).toMatchObject({
        method: 'GET',
        status_code: 200,
        query_keys: ['page', 'per'],
      });
      expect(JSON.stringify(apiCalls[0])).not.toContain('page=1');
    });
  });
});
