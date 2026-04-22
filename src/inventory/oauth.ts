import { createTokenData } from '../auth/token-utils.js';
import { getUserAgent } from '../server/user-agent.js';
import { formatResponseErrorInfo } from '../utils/error.js';
import {
  getInventoryCredentials,
  INVENTORY_AUTHORIZATION_ENDPOINT,
  INVENTORY_OAUTH_SCOPE,
  INVENTORY_TOKEN_ENDPOINT,
} from './config.js';
import { OAuthTokenResponseSchema, saveInventoryTokens, type TokenData } from './tokens.js';

export function buildInventoryAuthUrl(
  state: string,
  redirectUri: string,
  clientId: string,
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: INVENTORY_OAUTH_SCOPE,
    state,
  });

  return `${INVENTORY_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
}

export async function exchangeInventoryCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<TokenData> {
  const { clientId, clientSecret } = await getInventoryCredentials();

  const response = await fetch(INVENTORY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': getUserAgent(),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorInfo = await formatResponseErrorInfo(response);
    throw new Error(`Token exchange failed: ${response.status} ${errorInfo}`);
  }

  const jsonData: unknown = await response.json();
  const parseResult = OAuthTokenResponseSchema.safeParse(jsonData);
  if (!parseResult.success) {
    throw new Error(`Invalid token response format: ${parseResult.error.message}`);
  }

  const tokens = createTokenData(parseResult.data, {
    scope: INVENTORY_OAUTH_SCOPE,
  });

  await saveInventoryTokens(tokens);
  return tokens;
}
