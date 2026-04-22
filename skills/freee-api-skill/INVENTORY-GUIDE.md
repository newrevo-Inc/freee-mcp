# ロジクラ（freee 在庫管理）API ガイド

ロジクラ API を MCP 経由で操作する際の要点。

## ベース情報

- API ベース URL: https://api.logikura.com
- OAuth2 ホスト: https://logikura.com
- パス prefix: `/api/v{n}/`（現行は v1。将来 v2/v3 も `inventory_api_*` ツールで受理）
- スコープ: `read write`（configure 時に自動付与）
- レート制限: 1分あたり 100 リクエスト。超過時は 429 ステータス（OpenAPI 仕様は 499 と記載されているが、実 Rails 実装 (`external_api_base_controller.rb`) は 429 を返すため `inventory_api_*` ツールは両方をハンドル）+ `X-Rate-Limit-Reset` ヘッダ（秒）

## 代表的なユースケース

### 拠点一覧を取得

```
inventory_api_get { path: "/api/v1/warehouses" }
```

### 商品マスターを作成

```
inventory_api_post { path: "/api/v1/products", body: { name: "商品A", code: "SKU-001" } }
```

### 在庫数を取得

```
inventory_api_get { path: "/api/v1/stocks/1", query: { warehouse_id: 10 } }
```

### 出荷予定を確定

```
inventory_api_post { path: "/api/v1/shipping_schedules/123/ship" }
```

## 詳細リファレンス

各エンドポイントのパラメータ・レスポンス定義は `inventory-references/` 配下を参照。ファイル一覧は生成物に合わせて確認してください（実 schema の tags 結合により `inventory-receiving.md` / `inventory-shipping.md` など統合されています）。

## 注意点

- レスポンスのページネーションは `Link` ヘッダーで提供される（MCP ツールはペイロードをそのまま返すのでクライアント側で Link を解釈）
- 401 が返ったら `inventory_authenticate` を再実行すると refresh が試みられる
- 429 / 499 が返ったら `X-Rate-Limit-Reset` 秒後に再試行（OpenAPI 仕様は 499、実装は 429 で返る場合がある）
- 在庫 API の「商品マスター」は販売 API (sm) の「商品」とは別物。販売・売上管理は `freee_api_*` ツール、在庫・入出荷は `inventory_api_*` ツールを使う
