import crypto from 'node:crypto';
import open from 'open';
import prompts from 'prompts';
import {
  getDefaultAuthManager,
  startCallbackServer,
  stopCallbackServer,
} from '../../auth/server.js';
import {
  addMcpServerConfig,
  checkMcpConfigStatus,
  getTargetDisplayName,
  type McpTarget,
} from '../../config/mcp-config.js';
import { AUTH_TIMEOUT_MS } from '../../constants.js';
import { clearInventoryConfig, loadInventoryConfig, saveInventoryConfig } from '../config.js';
import { buildInventoryAuthUrl, exchangeInventoryCodeForTokens } from '../oauth.js';
import { collectInventoryCredentials, type InventoryCredentials } from './prompts.js';

interface InventoryConfigureOptions {
  force?: boolean;
}

async function resetExistingConfig(): Promise<void> {
  console.log('保存済みのログイン情報をリセットしています...');
  // 動的 import: --force 指定時のみ通る低頻度パスのため、
  // サーバー起動（configure 以外）では tokens.js の初期化コストを払わない
  const { clearInventoryTokens } = await import('../tokens.js');
  await clearInventoryTokens();
  await clearInventoryConfig();
  console.log('リセットが完了しました。\n');
}

async function saveCredentials(credentials: InventoryCredentials): Promise<void> {
  const config = await loadInventoryConfig();
  config.clientId = credentials.clientId;
  config.clientSecret = credentials.clientSecret;
  config.callbackPort = credentials.callbackPort;
  await saveInventoryConfig(config);
}

async function performInventoryOAuthFlow(credentials: InventoryCredentials): Promise<void> {
  console.log('ステップ 2/2: OAuth認証\n');
  console.log('ブラウザで認証ページを開きます...');

  await startCallbackServer(credentials.callbackPort);

  const state = crypto.randomBytes(16).toString('base64url');
  const redirectUri = `http://127.0.0.1:${credentials.callbackPort}/callback`;
  const authUrl = buildInventoryAuthUrl(state, redirectUri, credentials.clientId);

  console.log(`\n認証URL: ${authUrl}\n`);
  await open(authUrl);

  console.log('ブラウザで認証を完了してください...');
  console.log('認証が完了すると自動的に次のステップに進みます。\n');

  const authManager = getDefaultAuthManager();

  const callbackPromise = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('認証がタイムアウトしました（5分）')),
      AUTH_TIMEOUT_MS,
    );
    authManager.registerCliAuthHandler(state, {
      resolve: (code: string) => {
        clearTimeout(timeout);
        resolve(code);
      },
      reject: (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      },
      codeVerifier: '',
    });
  });

  return callbackPromise
    .then(async (authCode) => {
      console.log('認証コードを受け取りました。');
      console.log('トークンを取得中...');
      await exchangeInventoryCodeForTokens(authCode, redirectUri);
      console.log('トークンを取得しました。\n');
    })
    .finally(() => authManager.removeCliAuthHandler(state));
}

const INVENTORY_MCP_SERVER_NAME = 'freee-inventory-mcp';

async function addInventoryMcpConfig(target: McpTarget): Promise<void> {
  await addMcpServerConfig(target, INVENTORY_MCP_SERVER_NAME, {
    command: 'npx',
    args: ['--package=freee-mcp', '--', 'freee-inventory-mcp'],
  });
}

async function configureInventoryMcpTarget(
  target: 'claude-code' | 'claude-desktop',
): Promise<void> {
  const status = await checkMcpConfigStatus(target);
  const displayName = getTargetDisplayName(target);
  const { shouldAdd } = await prompts({
    type: 'confirm',
    name: 'shouldAdd',
    message: `${displayName} に freee-inventory を追加しますか?`,
    initial: true,
  });
  if (shouldAdd) {
    await addInventoryMcpConfig(target);
    console.log(`  ✓ ${displayName} に ${INVENTORY_MCP_SERVER_NAME} を追加しました。`);
    console.log(`    設定ファイル: ${status.path}`);
  } else {
    console.log(`  - ${displayName} への追加をスキップしました。`);
  }
}

async function configureInventoryMcp(): Promise<void> {
  console.log('=== MCP設定 ===\n');
  console.log('Claude Code / Claude Desktop に freee-inventory を設定できます。\n');
  await configureInventoryMcpTarget('claude-code');
  console.log('');
  await configureInventoryMcpTarget('claude-desktop');
  console.log('');
  console.log('=== Skill (API リファレンス) の更新 ===\n');
  console.log('freee 在庫管理 API リファレンスを利用するには、スキルを最新版に更新してください:\n');
  console.log('  npx skills add freee/freee-mcp\n');
}

export async function inventoryConfigure(options: InventoryConfigureOptions = {}): Promise<void> {
  console.log('\n=== freee-mcp vdev Inventory Configuration Setup ===\n');

  if (options.force) await resetExistingConfig();

  console.log('このウィザードでは、freee 在庫管理の設定と認証を対話式で行います。');
  console.log('freee 在庫管理の OAuth認証情報が必要です。\n');

  const credentials = await collectInventoryCredentials();
  console.log('\n認証情報を受け取りました。\n');

  await saveCredentials(credentials);
  await performInventoryOAuthFlow(credentials);

  stopCallbackServer();

  console.log('設定情報を保存しました。\n');
  console.log('認証情報は ~/.config/freee-mcp/inventory-config.json に保存されました。');
  console.log('トークンは ~/.config/freee-mcp/inventory-tokens.json に保存されました。\n');

  await configureInventoryMcp();

  console.log('セットアップ完了!');
  console.log('変更を反映するには、Claude Code / Claude Desktop を再起動してください。\n');
}
