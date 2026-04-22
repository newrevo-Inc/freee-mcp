import fs from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestTempDir } from '../test-utils/temp-dir.js';
import {
  getInventoryCredentials,
  loadInventoryConfig,
  resetInventoryConfigCache,
  type InventoryConfig,
} from './config.js';

const { setup: setupTempDir, cleanup: cleanupTempDir } = setupTestTempDir('inventory-config-test-');

vi.mock('fs/promises');
const mockFs = vi.mocked(fs);

const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
const originalClientId = process.env.FREEE_INVENTORY_CLIENT_ID;
const originalClientSecret = process.env.FREEE_INVENTORY_CLIENT_SECRET;

describe('inventory/config', () => {
  const validConfig: InventoryConfig = {
    clientId: 'inv-test-client-id',
    clientSecret: 'inv-test-client-secret',
    callbackPort: 54323,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const testTempDir = await setupTempDir();
    process.env.XDG_CONFIG_HOME = testTempDir;
    delete process.env.FREEE_INVENTORY_CLIENT_ID;
    delete process.env.FREEE_INVENTORY_CLIENT_SECRET;
    resetInventoryConfigCache();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (originalXdgConfigHome !== undefined) process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    else delete process.env.XDG_CONFIG_HOME;
    if (originalClientId !== undefined) process.env.FREEE_INVENTORY_CLIENT_ID = originalClientId;
    else delete process.env.FREEE_INVENTORY_CLIENT_ID;
    if (originalClientSecret !== undefined)
      process.env.FREEE_INVENTORY_CLIENT_SECRET = originalClientSecret;
    else delete process.env.FREEE_INVENTORY_CLIENT_SECRET;
    await cleanupTempDir();
  });

  describe('loadInventoryConfig', () => {
    it('inventory-config.json から読み込める', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(validConfig));
      const result = await loadInventoryConfig();
      expect(result).toEqual(validConfig);
    });

    it('ファイル不存在 → デフォルト生成', async () => {
      const err = new Error('ENOENT') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(err);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      const result = await loadInventoryConfig();
      expect(result.clientId).toBeUndefined();
    });

    it('破損 JSON → エラー', async () => {
      mockFs.readFile.mockResolvedValue('broken{{{');
      await expect(loadInventoryConfig()).rejects.toThrow();
    });
  });

  describe('getInventoryCredentials', () => {
    it('環境変数で上書きできる', async () => {
      process.env.FREEE_INVENTORY_CLIENT_ID = 'env-id';
      process.env.FREEE_INVENTORY_CLIENT_SECRET = 'env-secret';
      const result = await getInventoryCredentials();
      expect(result.clientId).toBe('env-id');
      expect(result.clientSecret).toBe('env-secret');
      expect(result.callbackPort).toBe(54323);
    });

    it('client_id 未設定 → configure 誘導', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({}));
      await expect(getInventoryCredentials()).rejects.toThrow('freee-inventory-mcp configure');
    });

    it('環境変数が片方だけ → エラー', async () => {
      process.env.FREEE_INVENTORY_CLIENT_ID = 'only-id';
      await expect(getInventoryCredentials()).rejects.toThrow('両方設定してください');
    });

    it('freee 本体の loadConfig に依存しない', async () => {
      process.env.FREEE_INVENTORY_CLIENT_ID = 'env-id';
      process.env.FREEE_INVENTORY_CLIENT_SECRET = 'env-secret';
      await getInventoryCredentials();
      expect(mockFs.readFile).not.toHaveBeenCalled();
    });
  });
});
