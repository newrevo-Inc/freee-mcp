import { FETCH_TIMEOUT_API_MS } from '../constants.js';
import { serializeErrorChain } from '../server/error-serializer.js';
import { sanitizePath } from '../server/logger.js';
import type { ApiCallErrorType } from '../server/request-context.js';
import { deriveQueryKeys, getCurrentRecorder } from '../server/request-context.js';
import { getUserAgent } from '../server/user-agent.js';
import { formatResponseErrorInfo } from '../utils/error.js';
import {
  INVENTORY_API_PATH_REGEX,
  INVENTORY_API_URL,
  INVENTORY_PATH_TRAVERSAL_REGEX,
} from './config.js';
import { getValidInventoryAccessToken } from './tokens.js';

export async function makeInventoryApiRequest(
  method: string,
  apiPath: string,
  params?: Record<string, unknown>,
  body?: Record<string, unknown>,
): Promise<unknown> {
  const recorder = getCurrentRecorder();
  const startTime = Date.now();
  const safePath = sanitizePath(apiPath);
  const queryKeys = deriveQueryKeys(recorder, params);

  // tools.ts の Zod で弾かれる想定だが二重防御（regex は config.ts で一元管理）
  if (
    !INVENTORY_API_PATH_REGEX.test(apiPath) ||
    apiPath.startsWith('//') ||
    INVENTORY_PATH_TRAVERSAL_REGEX.test(apiPath)
  ) {
    throw new Error('Invalid Inventory API path: /api/v{n}/ 始まりの相対パスを指定してください');
  }

  const accessToken = await getValidInventoryAccessToken();
  if (!accessToken) {
    throw new Error(
      '認証が必要です。inventory_authenticate ツールを使用して認証を行ってください。',
    );
  }

  const base = INVENTORY_API_URL.endsWith('/') ? INVENTORY_API_URL : `${INVENTORY_API_URL}/`;
  const url = new URL(apiPath.slice(1), base);

  // URL 正規化後に /api/v{n}/ namespace 外へ遷移していないか再検証
  // （path traversal regex を潜り抜けるペイロードへの保険）
  if (!INVENTORY_API_PATH_REGEX.test(url.pathname)) {
    throw new Error(
      'Invalid Inventory API path: /api/v{n}/ namespace 外への遷移は許可されていません',
    );
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.append(k, String(v));
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': getUserAgent(),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_API_MS),
  }).catch((fetchError: Error) => {
    const errorType: ApiCallErrorType =
      fetchError.name === 'TimeoutError' ? 'timeout' : 'network_error';
    recorder?.recordApiCall({
      method,
      path_pattern: safePath,
      status_code: null,
      duration_ms: Date.now() - startTime,
      error_type: errorType,
      query_keys: queryKeys,
    });
    recorder?.recordError({
      source: 'inventory_client',
      error_type: errorType,
      chain: serializeErrorChain(fetchError),
    });
    throw fetchError;
  });

  const recordFailure = (status: number, errorType: ApiCallErrorType, err: Error): never => {
    recorder?.recordApiCall({
      method,
      path_pattern: safePath,
      status_code: status,
      duration_ms: Date.now() - startTime,
      error_type: errorType,
      query_keys: queryKeys,
    });
    recorder?.recordError({
      source: 'inventory_client',
      status_code: status,
      error_type: errorType,
      chain: serializeErrorChain(err),
    });
    throw err;
  };

  if (response.status === 401) {
    const info = await formatResponseErrorInfo(response);
    recordFailure(
      401,
      'auth_error',
      new Error(
        `認証エラーが発生しました。inventory_authenticate ツールを使用して再認証を行ってください。\nエラー詳細: 401 ${info}`,
      ),
    );
  }

  // レートリミット応答: OpenAPI 仕様 (openapi/inventory-api-schema.json) では 499 記載、
  // 実 Rails 実装 (logikura の external_api_base_controller.rb) は 429 を返すため両対応
  if (response.status === 429 || response.status === 499) {
    const reset =
      response.headers.get('X-Rate-Limit-Reset') ||
      response.headers.get('RateLimit-Reset') ||
      response.headers.get('Retry-After');
    const msg = reset ? `${reset}秒後に再試行してください。` : '数分待ってから再試行してください。';
    recordFailure(
      response.status,
      'http_error',
      new Error(`レートリミットに達しました (${response.status})。${msg}`),
    );
  }

  if (!response.ok) {
    const info = await formatResponseErrorInfo(response);
    recordFailure(
      response.status,
      'http_error',
      new Error(`Inventory API request failed: ${response.status} ${info}`),
    );
  }

  if (response.status === 204) {
    recorder?.recordApiCall({
      method,
      path_pattern: safePath,
      status_code: response.status,
      duration_ms: Date.now() - startTime,
      error_type: null,
      query_keys: queryKeys,
    });
    return null;
  }

  const text = await response.text();
  if (!text) {
    recorder?.recordApiCall({
      method,
      path_pattern: safePath,
      status_code: response.status,
      duration_ms: Date.now() - startTime,
      error_type: null,
      query_keys: queryKeys,
    });
    return null;
  }

  return Promise.resolve(text)
    .then((t) => {
      const parsed = JSON.parse(t);
      recorder?.recordApiCall({
        method,
        path_pattern: safePath,
        status_code: response.status,
        duration_ms: Date.now() - startTime,
        error_type: null,
        query_keys: queryKeys,
      });
      return parsed;
    })
    .catch(() => {
      const parseError = new Error(
        `Failed to parse Inventory API response as JSON. Status: ${response.status}, Body preview: ${text.slice(0, 200)}`,
      );
      recorder?.recordApiCall({
        method,
        path_pattern: safePath,
        status_code: response.status,
        duration_ms: Date.now() - startTime,
        error_type: 'json_parse_error',
        query_keys: queryKeys,
      });
      recorder?.recordError({
        source: 'inventory_client',
        status_code: response.status,
        error_type: 'json_parse_error',
        chain: serializeErrorChain(parseError),
      });
      throw parseError;
    });
}
