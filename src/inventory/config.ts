import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { CONFIG_FILE_PERMISSION, getConfigDir } from '../constants.js';

// freee=54321, sign=54322 との競合を避けるため 54323
export const INVENTORY_DEFAULT_CALLBACK_PORT = 54323;

// API ホストと OAuth ホストが別ドメインなので環境変数も 2 本
export const INVENTORY_API_URL =
  process.env.FREEE_INVENTORY_API_URL?.replace(/\/+$/, '') || 'https://api.logikura.com';
export const INVENTORY_OAUTH_HOST =
  process.env.FREEE_INVENTORY_OAUTH_HOST?.replace(/\/+$/, '') || 'https://logikura.com';

export const INVENTORY_AUTHORIZATION_ENDPOINT = `${INVENTORY_OAUTH_HOST}/oauth/authorize`;
export const INVENTORY_TOKEN_ENDPOINT = `${INVENTORY_OAUTH_HOST}/oauth/token`;
export const INVENTORY_OAUTH_SCOPE = 'read write';

// API バージョン可変対応のパス検証 regex（tools.ts の Zod schema と client.ts の defense-in-depth で共有）
// 将来 /api/v2/ / /api/v3/ 等が追加されても regex 変更不要
export const INVENTORY_API_PATH_REGEX = /^\/api\/v\d+\//;
// path traversal 拒否用 regex（同じく tools.ts と client.ts で共有）
export const INVENTORY_PATH_TRAVERSAL_REGEX = /(\.\.|%2e%2e)/i;

export const INVENTORY_SERVER_INSTRUCTIONS =
  'ロジクラ（freee 在庫管理）APIと連携するMCPサーバー。商品マスター・拠点・入出荷・在庫・仕入先・出荷先の管理をサポート。';

const InventoryConfigSchema = z.object({
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  callbackPort: z.preprocess((val) => (val === null ? undefined : val), z.number().optional()),
});

export type InventoryConfig = z.infer<typeof InventoryConfigSchema>;

function getInventoryConfigFilePath(): string {
  return path.join(getConfigDir(), 'inventory-config.json');
}

async function ensureConfigDir(): Promise<void> {
  const configDir = path.dirname(getInventoryConfigFilePath());
  await fs.mkdir(configDir, { recursive: true });
}

function createDefaultConfig(): InventoryConfig {
  return { clientId: undefined, clientSecret: undefined, callbackPort: undefined };
}

let cachedInventoryConfig: InventoryConfig | null = null;

export function resetInventoryConfigCache(): void {
  cachedInventoryConfig = null;
}

export async function loadInventoryConfig(): Promise<InventoryConfig> {
  if (cachedInventoryConfig) return cachedInventoryConfig;
  const configPath = getInventoryConfigFilePath();
  return fs
    .readFile(configPath, 'utf8')
    .then((data) => {
      const parsed = JSON.parse(data);
      const result = InventoryConfigSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error(
          `Inventory 設定ファイルが不正です: ${result.error.message}\n` +
            '`freee-inventory-mcp configure` を実行して再設定してください。',
        );
      }
      cachedInventoryConfig = result.data;
      return cachedInventoryConfig;
    })
    .catch(async (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        const defaultConfig = createDefaultConfig();
        await saveInventoryConfig(defaultConfig);
        return defaultConfig;
      }
      throw error;
    });
}

export async function saveInventoryConfig(config: InventoryConfig): Promise<void> {
  await ensureConfigDir();
  const configPath = getInventoryConfigFilePath();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), { mode: CONFIG_FILE_PERMISSION });
  cachedInventoryConfig = config;
}

export async function clearInventoryConfig(): Promise<void> {
  const configPath = getInventoryConfigFilePath();
  return fs
    .unlink(configPath)
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    })
    .then(() => {
      cachedInventoryConfig = null;
    });
}

export async function getInventoryCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
  callbackPort: number;
}> {
  const envId = process.env.FREEE_INVENTORY_CLIENT_ID;
  const envSecret = process.env.FREEE_INVENTORY_CLIENT_SECRET;

  if (envId && envSecret) {
    return {
      clientId: envId,
      clientSecret: envSecret,
      callbackPort: INVENTORY_DEFAULT_CALLBACK_PORT,
    };
  }
  if (envId || envSecret) {
    throw new Error(
      'FREEE_INVENTORY_CLIENT_ID と FREEE_INVENTORY_CLIENT_SECRET は両方設定してください。',
    );
  }

  const config = await loadInventoryConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      'クライアントIDが設定されていません。\n' +
        '`freee-inventory-mcp configure` を実行してセットアップしてください。',
    );
  }
  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    callbackPort: config.callbackPort ?? INVENTORY_DEFAULT_CALLBACK_PORT,
  };
}
