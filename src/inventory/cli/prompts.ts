import prompts from 'prompts';
import { INVENTORY_DEFAULT_CALLBACK_PORT, loadInventoryConfig } from '../config.js';

export interface InventoryCredentials {
  clientId: string;
  clientSecret: string;
  callbackPort: number;
}

export async function collectInventoryCredentials(): Promise<InventoryCredentials> {
  const existing = await loadInventoryConfig();
  const hasExisting = !!(existing.clientId && existing.clientSecret);

  if (hasExisting) {
    console.log('既存の設定が見つかりました。');
    console.log('  変更しない項目はそのまま Enter を押してください。\n');
  }

  console.log('ステップ 1/2: ロジクラ OAuth認証情報の入力\n');
  const defaultPort = existing.callbackPort || INVENTORY_DEFAULT_CALLBACK_PORT;
  console.log(
    `ロジクラアプリのコールバックURLには http://127.0.0.1:${defaultPort}/callback を設定してください。\n`,
  );

  const result = await prompts([
    {
      type: 'text',
      name: 'clientId',
      message: 'FREEE_INVENTORY_CLIENT_ID:',
      initial: existing.clientId || undefined,
      validate: (value: string) => (value.trim() ? true : 'CLIENT_ID は必須です'),
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: hasExisting
        ? 'FREEE_INVENTORY_CLIENT_SECRET (変更しない場合は空欄):'
        : 'FREEE_INVENTORY_CLIENT_SECRET:',
      validate: (value: string) => {
        if (hasExisting && !value.trim()) return true;
        return value.trim() ? true : 'CLIENT_SECRET は必須です';
      },
    },
    {
      type: 'text',
      name: 'callbackPort',
      message: 'コールバックポート (コールバックURL: http://127.0.0.1:<port>/callback):',
      initial: String(defaultPort),
      validate: (value: string) => {
        const port = parseInt(value.trim(), 10);
        if (Number.isNaN(port) || port < 1 || port > 65535) {
          return '有効なポート番号を入力してください (1〜65535)';
        }
        return true;
      },
    },
  ]);

  if (!result.clientId) throw new Error('セットアップがキャンセルされました。');

  return {
    clientId: result.clientId.trim(),
    clientSecret: result.clientSecret?.trim() || existing.clientSecret || '',
    callbackPort: parseInt(result.callbackPort, 10),
  };
}
