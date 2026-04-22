# 商品マスター

## 概要

商品マスターの操作

## エンドポイント一覧

### GET /api/v1/products

操作: 商品マスター一覧

### レスポンス (200)

商品マスター一覧

- products (必須): array[object]
  配列の要素:
    - id (任意): integer(integer) 例: `1` (最小: 1)
    - name (任意): string - 商品名 例: `Tシャツ`
    - master_code (任意): string - 商品代表コード 例: `LOGIKURA`
    - description (任意): string - 詳細 例: `青色`
    - tax_type_id (任意): integer(double) - 消費税率
- 1: 8.00
- 2: 10.00 (選択肢: 1, 2)
    - countryCode (任意): string - 原産国 例: `JP`
    - suppliers (任意): array[object]
    - variants (任意): array[object]

### POST /api/v1/products

操作: 商品マスター作成

### リクエストボディ

(必須)

- product (必須): object
  - name (任意): string - 商品名 例: `Tシャツ`
  - master_code (任意): string - 商品代表コード 例: `LOGIKURA`
  - description (任意): string - 商品説明 例: `シンプルな無地Tシャツです`
  - tax_type_id (任意): integer(double) - 消費税率
- 1: 8.00
- 2: 10.00 (選択肢: 1, 2)
  - countryCode (任意): string - 原産国 例: `JP`
  - suppliers (任意): array[object]

### レスポンス (200)

商品マスター

- product (任意): object
  - id (任意): integer(integer) 例: `1` (最小: 1)
  - name (任意): string - 商品名 例: `Tシャツ`
  - master_code (任意): string - 商品代表コード 例: `LOGIKURA`
  - description (任意): string - 詳細 例: `青色`
  - tax_type_id (任意): integer(double) - 消費税率
- 1: 8.00
- 2: 10.00 (選択肢: 1, 2)
  - countryCode (任意): string - 原産国 例: `JP`
  - suppliers (任意): array[object]
  - variants (任意): array[object]

### GET /api/v1/products/{id}

操作: 商品マスター詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 商品マスターID |

### レスポンス (200)

商品マスター詳細

- id (任意): integer(integer) 例: `1` (最小: 1)
- name (任意): string - 商品名 例: `Tシャツ`
- master_code (任意): string - 商品代表コード 例: `LOGIKURA`
- description (任意): string - 詳細 例: `青色`
- tax_type_id (任意): integer(double) - 消費税率
- 1: 8.00
- 2: 10.00 (選択肢: 1, 2)
- countryCode (任意): string - 原産国 例: `JP`
- suppliers (任意): array[object]
- variants (任意): array[object]
  配列の要素:
    - id (任意): object - 種類ID
    - product_id (任意): object - 商品マスターID
    - name (任意): string - 種類名 例: `Tシャツ`
    - product_code (任意): string - 商品コード 例: `LOGIKURA-123`
    - barcode (任意): string - バーコード 例: `2200020050008`
    - sales_price (任意): string(double) - 販売価格 例: `200`
    - purchase_price (任意): string(double) - 仕入れ価格 例: `100`
    - weight (任意): string - 重量 例: `100`
    - weight_unit (任意): string - 重量単位 例: `g`
    - image (任意): string - 画像URL 例: `https://logikura.com/images/searching.png`
    - option1 (任意): object - オプション1 例: `赤`
    - option2 (任意): object - オプション2 例: `Sサイズ`
    - option3 (任意): object - オプション3 例: `綿`
    - order_point (任意): integer - 種類発注点 例: `100` (最小: 0)
    - sales_start_date (任意): string - 販売開始日 例: `2019-01-01`

### PUT /api/v1/products/{id}

操作: 商品マスター更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 商品マスターID |

### リクエストボディ

(必須)


### レスポンス (200)

商品マスター

- product (任意): object
  - id (任意): integer(integer) 例: `1` (最小: 1)
  - name (任意): string - 商品名 例: `Tシャツ`
  - master_code (任意): string - 商品代表コード 例: `LOGIKURA`
  - description (任意): string - 詳細 例: `青色`
  - tax_type_id (任意): integer(double) - 消費税率
- 1: 8.00
- 2: 10.00 (選択肢: 1, 2)
  - countryCode (任意): string - 原産国 例: `JP`
  - suppliers (任意): array[object]
  - variants (任意): array[object]



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
