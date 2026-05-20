# 種類

## 概要

種類の操作

## エンドポイント一覧

### GET /api/v1/product_variants

操作: 種類一覧

### レスポンス (200)

種類一覧

- product_variants (必須): array[object]
  配列の要素:
    - id (任意): integer(integer) - 種類ID 例: `1` (最小: 1)
    - product_id (任意): integer(integer) - 商品マスターID 例: `1` (最小: 1)
    - name (任意): string - 種類名 例: `Tシャツ`
    - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
    - barcode (任意): string - バーコード 例: `2200020050008`
    - sales_price (任意): string(double) - 販売価格 例: `200`
    - purchase_price (任意): string(double) - 仕入れ価格 例: `100`
    - weight (任意): string - 重量 例: `100`
    - weight_unit (任意): string - 重量単位 例: `g`
    - image (任意): string - 画像URL 例: `https://logikura.com/images/searching.png`
    - option1 (任意): string - オプション1
    - option2 (任意): string - オプション2
    - option3 (任意): string - オプション3
    - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
    - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### POST /api/v1/product_variants

操作: 種類作成

### リクエストボディ

(必須)

- product_variant (必須): object
  - product_id (必須): integer(integer) - 商品マスターID 例: `1` (最小: 1)
  - name (必須): string - 名前 例: `tシャツ ロング`
  - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
  - barcode (任意): string - バーコード 例: `2200020050008`
  - sales_price (必須): integer(double) - 販売価格 例: `200`
  - purchase_price (必須): integer(double) - 仕入れ価格 例: `100`
  - weight (任意): string - 重量 例: `100`
  - weight_unit_id (必須): integer - 重量単位ID
- 1: g
- 2: kg (選択肢: 1, 2)
  - image (任意): string - 画像URL<br>非同期に取得するので反映までに時間がかかります 例: `https://logikura.com/images/searching.png`
  - option1 (任意): string - オプション1
  - option2 (任意): string - オプション2
  - option3 (任意): string - オプション3
  - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
  - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### レスポンス (200)

種類

- product_varian (任意): object
  - id (任意): integer(integer) - 種類ID 例: `1` (最小: 1)
  - product_id (任意): integer(integer) - 商品マスターID 例: `1` (最小: 1)
  - name (任意): string - 種類名 例: `Tシャツ`
  - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
  - barcode (任意): string - バーコード 例: `2200020050008`
  - sales_price (任意): string(double) - 販売価格 例: `200`
  - purchase_price (任意): string(double) - 仕入れ価格 例: `100`
  - weight (任意): string - 重量 例: `100`
  - weight_unit (任意): string - 重量単位 例: `g`
  - image (任意): string - 画像URL 例: `https://logikura.com/images/searching.png`
  - option1 (任意): string - オプション1
  - option2 (任意): string - オプション2
  - option3 (任意): string - オプション3
  - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
  - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### GET /api/v1/product_variants/{id}

操作: 種類詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 種類ID |

### レスポンス (200)

種類詳細

- id (任意): integer(integer) - 種類ID 例: `1` (最小: 1)
- product_id (任意): integer(integer) - 商品マスターID 例: `1` (最小: 1)
- name (任意): string - 種類名 例: `Tシャツ`
- product_code (任意): string - 商品コード 例: `LOGIKURA-123`
- barcode (任意): string - バーコード 例: `2200020050008`
- sales_price (任意): string(double) - 販売価格 例: `200`
- purchase_price (任意): string(double) - 仕入れ価格 例: `100`
- weight (任意): string - 重量 例: `100`
- weight_unit (任意): string - 重量単位 例: `g`
- image (任意): string - 画像URL 例: `https://logikura.com/images/searching.png`
- option1 (任意): string - オプション1
- option2 (任意): string - オプション2
- option3 (任意): string - オプション3
- order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
- sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### PUT /api/v1/product_variants/{id}

操作: 種類更新

### リクエストボディ

(必須)

- product_variant (必須): object
  - id (任意): integer - 種類ーID 例: `1` (最小: 1)
  - name (任意): string - 名前 例: `tシャツ ロング`
  - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
  - barcode (任意): string - バーコード 例: `2200020050008`
  - sales_price (任意): integer(double) - 販売価格 例: `200`
  - purchase_price (任意): integer(double) - 仕入れ価格 例: `100`
  - weight (任意): string - 重量 例: `100`
  - weight_unit_id (任意): integer - 重量単位ID
- 1: g
- 2: kg (選択肢: 1, 2)
  - image (任意): string - 画像URL<br>非同期に取得するので反映までに時間がかかります 例: `https://logikura.com/images/searching.png`
  - option1 (任意): string - オプション1
  - option2 (任意): string - オプション2
  - option3 (任意): string - オプション3
  - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
  - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### レスポンス (200)

種類

- product_variant (任意): object
  - id (任意): integer(integer) - 種類ID 例: `1` (最小: 1)
  - product_id (任意): integer(integer) - 商品マスターID 例: `1` (最小: 1)
  - name (任意): string - 種類名 例: `Tシャツ`
  - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
  - barcode (任意): string - バーコード 例: `2200020050008`
  - sales_price (任意): string(double) - 販売価格 例: `200`
  - purchase_price (任意): string(double) - 仕入れ価格 例: `100`
  - weight (任意): string - 重量 例: `100`
  - weight_unit (任意): string - 重量単位 例: `g`
  - image (任意): string - 画像URL 例: `https://logikura.com/images/searching.png`
  - option1 (任意): string - オプション1
  - option2 (任意): string - オプション2
  - option3 (任意): string - オプション3
  - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
  - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
