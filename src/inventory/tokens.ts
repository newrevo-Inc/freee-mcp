import fs from 'node:fs/promises';
import path from 'node:path';
import {
  OAuthTokenResponseSchema,
  refreshFreeeTokenRaw,
  type TokenData,
  TokenDataSchema,
} from '../auth/tokens.js';
import { CONFIG_FILE_PERMISSION, getConfigDir } from '../constants.js';
import {
  getInventoryCredentials,
  INVENTORY_OAUTH_SCOPE,
  INVENTORY_TOKEN_ENDPOINT,
} from './config.js';

export { OAuthTokenResponseSchema, type TokenData };
export const InventoryTokenDataSchema = TokenDataSchema;

function getInventoryTokenFilePath(): string {
  return path.join(getConfigDir(), 'inventory-tokens.json');
}

export async function saveInventoryTokens(tokens: TokenData): Promise<void> {
  const tokenPath = getInventoryTokenFilePath();
  await fs.mkdir(path.dirname(tokenPath), { recursive: true });
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2), {
    mode: CONFIG_FILE_PERMISSION,
  });
}

export async function loadInventoryTokens(): Promise<TokenData | null> {
  const tokenPath = getInventoryTokenFilePath();
  return fs
    .readFile(tokenPath, 'utf8')
    .then((data) => {
      const parsed = JSON.parse(data);
      const result = InventoryTokenDataSchema.safeParse(parsed);
      if (!result.success) {
        console.error('[error] Invalid inventory token file:', result.error.message);
        return null;
      }
      return result.data;
    })
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      // JSON parse error 等は復旧可能にするため null を返し、呼び出し側で再認証へ誘導する
      console.error('[error] Failed to load inventory tokens:', error);
      return null;
    });
}

export function isInventoryTokenValid(tokens: TokenData): boolean {
  return Date.now() < tokens.expires_at;
}

export async function refreshInventoryAccessToken(refreshToken: string): Promise<TokenData> {
  const { clientId, clientSecret } = await getInventoryCredentials();
  const tokens = await refreshFreeeTokenRaw(refreshToken, {
    clientId,
    clientSecret,
    tokenEndpoint: INVENTORY_TOKEN_ENDPOINT,
    scope: INVENTORY_OAUTH_SCOPE,
  });
  await saveInventoryTokens(tokens);
  return tokens;
}

export async function getValidInventoryAccessToken(): Promise<string | null> {
  const tokens = await loadInventoryTokens();
  if (!tokens) return null;
  if (isInventoryTokenValid(tokens)) return tokens.access_token;
  const refreshed = await refreshInventoryAccessToken(tokens.refresh_token);
  return refreshed.access_token;
}

export async function clearInventoryTokens(): Promise<void> {
  const tokenPath = getInventoryTokenFilePath();
  return fs.unlink(tokenPath).then(
    () => console.error('[info] Inventory tokens cleared successfully'),
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        console.error('[info] No inventory tokens to clear');
        return;
      }
      throw error;
    },
  );
}
