# 外部連携

## 概要

外部連携の操作

## エンドポイント一覧

### GET /api/v1/external_service_accounts

操作: 外部連携アカウント一覧

説明: 外部連携アカウント一覧

### レスポンス (200)

OK

- external_service_accounts (必須): array[object]
  配列の要素:
    - id (必須): integer - 外部連携アカウントID 例: `1` (最小: 1)
    - name (必須): string - 連携アカウント名 例: `株式会社ロジクラ`
    - uid (必須): string - 連携先ID名 例: `external-uid`
    - shop_id (任意): integer - ショップID（店舗連携時のみ） 例: `1` (最小: 1)
    - external_service_name (必須): string - 外部連携サービス名 例: `スマレジ`

### POST /api/v1/external_service_product_variants

操作: 商品の外部サービス連携紐付け作成

### リクエストボディ

(必須)

- external_service_account_id (必須): integer(integer) - 外部連携アカウントID 例: `1` (最小: 1)
- product_variant_id (必須): integer(integer) - 種類ID 例: `1` (最小: 1)
- external_service_product_code (必須): string - 連携先コード 例: `SHOPIFY-PRODUCT-CODE`

### レスポンス (200)

外部連携紐付け

- external_service_product_variant (必須): object
  - id (必須): integer(integer) - 外部連携紐付けID 例: `1` (最小: 1)
  - external_service_account_id (必須): integer(integer) - 外部連携アカウントID 例: `1` (最小: 1)
  - product_variant_id (必須): integer(integer) - 種類ID 例: `1` (最小: 1)
  - external_service_product_code (必須): string - 連携先コード 例: `SHOPIFY-PRODUCT-CODE`

### PUT /api/v1/external_service_product_variants/{id}

操作: 商品の外部サービス連携紐付け更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 外部連携紐付けID |

### リクエストボディ

(必須)

- external_service_product_code (必須): string - 連携先コード 例: `SHOPIFY-PRODUCT-CODE`

### レスポンス (200)

外部連携紐付け

- external_service_product_variant (必須): object
  - id (必須): integer(integer) - 外部連携紐付けID 例: `1` (最小: 1)
  - external_service_account_id (必須): integer(integer) - 外部連携アカウントID 例: `1` (最小: 1)
  - product_variant_id (必須): integer(integer) - 種類ID 例: `1` (最小: 1)
  - external_service_product_code (必須): string - 連携先コード 例: `SHOPIFY-PRODUCT-CODE`

### DELETE /api/v1/external_service_product_variants/{id}

操作: 商品の外部サービス連携紐付け削除

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 外部連携紐付けID |

### レスポンス (200)

削除した外部連携紐付け

- external_service_product_variant (必須): object
  - id (必須): integer(integer) - 外部連携紐付けID 例: `1` (最小: 1)
  - external_service_account_id (必須): integer(integer) - 外部連携アカウントID 例: `1` (最小: 1)
  - product_variant_id (必須): integer(integer) - 種類ID 例: `1` (最小: 1)
  - external_service_product_code (必須): string - 連携先コード 例: `SHOPIFY-PRODUCT-CODE`



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
