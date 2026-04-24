import crypto from 'node:crypto';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDefaultAuthManager, startCallbackServerWithAutoStop } from '../auth/server.js';
import { AUTH_TIMEOUT_MS, PACKAGE_VERSION } from '../constants.js';
import { createTextResponse, formatErrorMessage } from '../utils/error.js';
import { makeInventoryApiRequest } from './client.js';
import {
  getInventoryCredentials,
  INVENTORY_API_PATH_REGEX,
  INVENTORY_PATH_TRAVERSAL_REGEX,
} from './config.js';
import { buildInventoryAuthUrl, exchangeInventoryCodeForTokens } from './oauth.js';
import { clearInventoryTokens, isInventoryTokenValid, loadInventoryTokens } from './tokens.js';

function addInventoryAuthTools(server: McpServer): void {
  server.registerTool(
    'inventory_authenticate',
    {
      title: 'ロジクラ OAuth認証',
      description: 'ロジクラ（freee 在庫管理）OAuth認証を開始（初回のみ必要）',
      annotations: { destructiveHint: false },
    },
    async () => {
      return getInventoryCredentials()
        .then(async ({ clientId, callbackPort }) => {
          await startCallbackServerWithAutoStop(AUTH_TIMEOUT_MS, callbackPort);
          const state = crypto.randomBytes(16).toString('hex');
          const redirectUri = `http://127.0.0.1:${callbackPort}/callback`;
          const authUrl = buildInventoryAuthUrl(state, redirectUri, clientId);

          const authManager = getDefaultAuthManager();
          // fire-and-forget: MCP ツール応答は authUrl を返した時点で完了するため、
          // ここでのトークン交換失敗は inventory-tokens.json 不在（= inventory_auth_status で「未認証」表示）
          // としてのみユーザーに伝わる。失敗詳細は stderr（console.error）で観測可能
          authManager.registerCliAuthHandler(state, {
            resolve: (code: string): void => {
              exchangeInventoryCodeForTokens(code, redirectUri)
                .then(() => console.error('Inventory authentication completed successfully'))
                .catch((err) => console.error('Inventory token exchange failed:', err))
                .finally(() => authManager.removeCliAuthHandler(state));
            },
            reject: (error: Error): void => {
              console.error('Inventory authentication failed:', error);
              authManager.removeCliAuthHandler(state);
            },
            codeVerifier: '',
          });
          return createTextResponse(
            `認証URL: ${authUrl}\n\nブラウザで開いて認証してください。5分でタイムアウトします。`,
          );
        })
        .catch((error) => createTextResponse(`認証開始に失敗: ${formatErrorMessage(error)}`));
    },
  );

  server.registerTool(
    'inventory_auth_status',
    {
      title: 'ロジクラ 認証状態',
      description: 'ロジクラの認証状態を確認',
      annotations: { readOnlyHint: true },
    },
    async () => {
      return loadInventoryTokens()
        .then((tokens) => {
          if (!tokens) {
            return createTextResponse(
              '未認証です。inventory_authenticate ツールを使用して認証を行ってください。',
            );
          }
          if (isInventoryTokenValid(tokens)) {
            const expiresAt = new Date(tokens.expires_at).toLocaleString('ja-JP');
            return createTextResponse(`認証済み（有効）\n有効期限: ${expiresAt}`);
          }
          return createTextResponse(
            'トークンの有効期限が切れていますが、次回API使用時に自動更新されます。\n' +
              '自動更新に失敗する場合は inventory_authenticate ツールで再認証してください。',
          );
        })
        .catch((error) => createTextResponse(`認証状態の確認に失敗: ${formatErrorMessage(error)}`));
    },
  );

  server.registerTool(
    'inventory_clear_auth',
    {
      title: 'ロジクラ 認証クリア',
      description: 'ロジクラの認証情報をクリア',
      annotations: { destructiveHint: true },
    },
    async () => {
      return clearInventoryTokens()
        .then(() => createTextResponse('ロジクラの認証情報をクリアしました。'))
        .catch((error) =>
          createTextResponse(`認証情報のクリアに失敗: ${formatErrorMessage(error)}`),
        );
    },
  );
}

export function addInventoryApiTools(server: McpServer): void {
  const methods = [
    { name: 'inventory_api_get', method: 'GET', desc: 'ロジクラ API GET' },
    { name: 'inventory_api_post', method: 'POST', desc: 'ロジクラ API POST' },
    { name: 'inventory_api_put', method: 'PUT', desc: 'ロジクラ API PUT' },
    { name: 'inventory_api_patch', method: 'PATCH', desc: 'ロジクラ API PATCH' },
    { name: 'inventory_api_delete', method: 'DELETE', desc: 'ロジクラ API DELETE' },
  ] as const;

  for (const { name, method, desc } of methods) {
    // Logikura OpenAPI では DELETE に requestBody が無いため、ツール側でも body を受け付けない
    const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';
    const baseSchema = {
      // /api/v{n}/ 以外 (v1/v2/v3 対応)。absolute URL / protocol-relative は拒否。
      path: z
        .string()
        .regex(INVENTORY_API_PATH_REGEX, 'path は /api/v{n}/ から始まる相対パスを指定してください')
        .refine((p) => !INVENTORY_PATH_TRAVERSAL_REGEX.test(p), {
          message: 'path に path traversal (.. / %2e%2e) を含めることはできません',
        })
        .describe('APIパス (例: /api/v1/warehouses)'),
      query: z.record(z.string(), z.unknown()).optional().describe('クエリパラメータ'),
    };
    const inputSchema = hasBody
      ? {
          ...baseSchema,
          body: z.record(z.string(), z.unknown()).optional().describe('リクエストボディ'),
        }
      : baseSchema;

    server.registerTool(
      name,
      {
        title: desc,
        description: desc,
        inputSchema,
        annotations: { readOnlyHint: method === 'GET' },
      },
      async (args: {
        path: string;
        query?: Record<string, unknown>;
        body?: Record<string, unknown>;
      }) => {
        return makeInventoryApiRequest(method, args.path, args.query, args.body)
          .then((res) =>
            res === null
              ? createTextResponse('操作が完了しました（レスポンスなし）。')
              : createTextResponse(JSON.stringify(res, null, 2)),
          )
          .catch((error) => createTextResponse(formatErrorMessage(error)));
      },
    );
  }
}

export function addInventoryAuthenticationTools(server: McpServer): void {
  addInventoryAuthTools(server);
  server.registerTool(
    'inventory_server_info',
    {
      title: 'ロジクラ サーバー情報',
      description: 'freee-inventory-mcp サーバーの情報を取得',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      createTextResponse(
        `freee-inventory-mcp server info:\n- version: ${PACKAGE_VERSION}\n- transport: stdio`,
      ),
  );
}
