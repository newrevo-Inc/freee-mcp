---
name: freee-api-skill
description: "freee-inventory-mcp と連携するスキル。freee 在庫管理（ロジクラ）の商品マスター・拠点・入出荷予定・在庫・仕入先・出荷先・ショップ・外部連携の詳細 API リファレンスと使い方ガイドを提供する。在庫管理・倉庫管理・入出荷・棚卸・ロジクラに関する質問や操作を依頼してきた場合は、明示的に freee や ロジクラ と言及していなくても、このスキルの利用を検討すること。freee-inventory-mcp の設定が必要。"
license: Apache-2.0
metadata:
  homepage: https://github.com/newrevo-Inc/freee-mcp
---

# freee 在庫管理 API スキル

## 概要

freee 在庫管理（ロジクラ）のデータを AI から直接操作できるスキルです。

`freee-inventory-mcp`（MCP サーバー）を通じて ロジクラ API と連携します。

このスキルの役割:

- ロジクラ API の詳細リファレンスを提供
- `freee-inventory-mcp` 使用ガイドと API 呼び出し例を提供

## セットアップ

ローカルで MCP サーバーを起動します。

```bash
npx freee-inventory-mcp configure
```

ブラウザで ロジクラにログインし、OAuth 認証を完了します。設定は `~/.config/freee-mcp/inventory-config.json` に保存されます。

MCP クライアント設定例:

```json
{
  "mcpServers": {
    "freee-inventory": {
      "command": "npx",
      "args": ["freee-inventory-mcp"]
    }
  }
}
```

クライアント再起動後、`inventory_auth_status` ツールで認証状態を確認できます。

## リファレンス

API リファレンスは `inventory-references/` に含まれます。各リファレンスにはパラメータ、リクエストボディ、レスポンスの詳細情報があります。

目的の API を探すには、`inventory-references/` ディレクトリ内のファイルをキーワード検索してください。

主なリファレンス:

- `inventory-warehouses.md` - 拠点
- `inventory-products.md` - 商品マスター
- `inventory-product-variants.md` - 商品の種類
- `inventory-stocks.md` - 在庫
- `inventory-receiving.md` - 入荷
- `inventory-shipping.md` - 出荷
- `inventory-suppliers.md` - 仕入先
- `inventory-consignees.md` - 出荷先
- `inventory-shops.md` - ショップ
- `inventory-external-services.md` - 外部連携

## 使い方

### MCP ツール

認証:

- `inventory_authenticate` - ロジクラ OAuth 認証
- `inventory_auth_status` - 認証状態確認
- `inventory_clear_auth` - 認証情報クリア

サーバー情報:

- `inventory_server_info` - サーバー情報取得（バージョン、transport）

API 呼び出し:

- `inventory_api_get` - GET リクエスト
- `inventory_api_post` - POST リクエスト
- `inventory_api_put` - PUT リクエスト
- `inventory_api_patch` - PATCH リクエスト
- `inventory_api_delete` - DELETE リクエスト

### 基本ワークフロー

1. 認証状態を確認: `inventory_auth_status`。未認証なら `inventory_authenticate` を実行
2. ガイドを確認: `INVENTORY-GUIDE.md` を参照してベース URL・パス prefix・レート制限などの前提を把握
3. リファレンスを検索: 必要に応じて `inventory-references/` を参照
4. API を呼び出す: `inventory_api_*` ツールを使用

詳しい操作上の注意点（レート制限、ページネーション、認証エラー時の対処など）は `INVENTORY-GUIDE.md` を参照してください。

## エラー対応

- バージョン確認: `VERSION.md` を読んでスキルのバージョンを確認し（ファイルが存在しない場合は開発版を使用中）、`inventory_server_info` でサーバーバージョンを確認してください。スキルのバージョンがサーバーより古い場合、スキルの情報が最新のサーバーに対応していない可能性があります。スキルを最新版に更新してから再度お試しください。
- 認証エラー: `inventory_auth_status` で確認 → `inventory_clear_auth` → `inventory_authenticate`
- 429 / 499（レート制限）: `X-Rate-Limit-Reset` 秒後に再試行

## 関連リンク

- ロジクラ: https://logikura.com
- ロジクラ API ベース URL: https://api.logikura.com
