import fs from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestTempDir } from '../test-utils/temp-dir.js';
import {
  clearInventoryTokens,
  getValidInventoryAccessToken,
  isInventoryTokenValid,
  loadInventoryTokens,
  refreshInventoryAccessToken,
  saveInventoryTokens,
  type TokenData,
} from './tokens.js';

const { setup: setupTempDir, cleanup: cleanupTempDir } = setupTestTempDir('inventory-tokens-test-');

vi.mock('fs/promises');
vi.mock('./config.js', () => ({
  INVENTORY_TOKEN_ENDPOINT: 'https://logikura.com/oauth/token',
  INVENTORY_OAUTH_SCOPE: 'read write',
  getInventoryCredentials: (): Promise<{
    clientId: string;
    clientSecret: string;
    callbackPort: number;
  }> => Promise.resolve({ clientId: 'cid', clientSecret: 'csec', callbackPort: 54323 }),
}));

const mockFs = vi.mocked(fs);
const mockFetch = vi.fn();
global.fetch = mockFetch;

const originalXdg = process.env.XDG_CONFIG_HOME;

describe('inventory/tokens', () => {
  const mockTokens: TokenData = {
    access_token: 'inv-at',
    refresh_token: 'inv-rt',
    expires_at: Date.now() + 7_200_000,
    token_type: 'Bearer',
    scope: 'read write',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.XDG_CONFIG_HOME = await setupTempDir();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (originalXdg !== undefined) process.env.XDG_CONFIG_HOME = originalXdg;
    else delete process.env.XDG_CONFIG_HOME;
    await cleanupTempDir();
  });

  it('saveInventoryTokens は 0600 で書き出す', async () => {
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    await saveInventoryTokens(mockTokens);
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('inventory-tokens.json'),
      JSON.stringify(mockTokens, null, 2),
      expect.objectContaining({ mode: 0o600 }),
    );
  });

  it('loadInventoryTokens: ENOENT → null', async () => {
    const err = new Error() as NodeJS.ErrnoException;
    err.code = 'ENOENT';
    mockFs.readFile.mockRejectedValue(err);
    expect(await loadInventoryTokens()).toBeNull();
  });

  it('loadInventoryTokens: 破損 → null', async () => {
    mockFs.readFile.mockResolvedValue('junk{{{');
    expect(await loadInventoryTokens()).toBeNull();
  });

  it('isInventoryTokenValid: 期限内 true / 期限切れ false', () => {
    expect(isInventoryTokenValid(mockTokens)).toBe(true);
    expect(isInventoryTokenValid({ ...mockTokens, expires_at: Date.now() - 1 })).toBe(false);
  });

  it('refreshInventoryAccessToken: 成功で新トークン保存', async () => {
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new-at',
          refresh_token: 'new-rt',
          expires_in: 7200,
          token_type: 'Bearer',
        }),
    });
    const result = await refreshInventoryAccessToken('old-rt');
    expect(result.access_token).toBe('new-at');
    expect(result.scope).toBe('read write');
    expect(mockFs.writeFile).toHaveBeenCalled();
  });

  it('refreshInventoryAccessToken: 401 → Token refresh failed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    });
    await expect(refreshInventoryAccessToken('bad')).rejects.toThrow('Token refresh failed: 401');
  });

  it('getValidInventoryAccessToken: 有効トークン返却', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify(mockTokens));
    expect(await getValidInventoryAccessToken()).toBe('inv-at');
  });

  it('getValidInventoryAccessToken: 期限切れ → 自動 refresh', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({ ...mockTokens, expires_at: Date.now() - 1 }),
    );
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: 'refreshed', refresh_token: 'new-rt', expires_in: 7200 }),
    });
    expect(await getValidInventoryAccessToken()).toBe('refreshed');
  });

  it('clearInventoryTokens: ENOENT は無視', async () => {
    const err = new Error() as NodeJS.ErrnoException;
    err.code = 'ENOENT';
    mockFs.unlink.mockRejectedValue(err);
    await expect(clearInventoryTokens()).resolves.not.toThrow();
  });
});
