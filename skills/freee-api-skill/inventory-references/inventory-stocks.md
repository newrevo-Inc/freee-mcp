# 在庫

## 概要

在庫の操作

## エンドポイント一覧

### GET /api/v1/stocks/{id}

操作: 在庫詳細取得

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 在庫ID |

### レスポンス (200)

OK

- stock (必須): object
  - id (必須): object - 在庫ID
  - inventory_id (必須): object - インベントリID
  - lot_code (必須): string - ロット番号 例: `LOT001`
  - expiration_date (必須): string(date) - 有効期限 例: `2025-12-31`
  - quantity (必須): integer - 在庫数 例: `1000` (最小: 0)

### GET /api/v1/inventories

操作: 在庫一覧

説明: 在庫一覧

### レスポンス (200)

OK

- inventories (必須): array[object]
  配列の要素:
    - id (必須): integer - 在庫ID 例: `1` (最小: 1)
    - warehouse_id (必須): integer - 拠点ID 例: `1` (最小: 1)
    - product_variant (必須): object
    - quantity (必須): integer - 在庫数 例: `1000` (最小: 0)
    - updated_at (必須): string - 最終更新日 例: `2020-12-04T10:09:53.175+09:00`
    - will_pick_quantity (必須): integer - 出荷中数量 例: `2` (最小: 0)
    - not_assigned_quantity (必須): integer - 未割当数量 例: `998` (最小: 0)

### POST /api/v1/inventories

操作: 在庫作成

### リクエストボディ

(必須)

- inventory (必須): object
  - warehouse_id (必須): integer - 拠点ID 例: `1` (最小: 1)
  - location_id (必須): integer - ロケーションID 例: `1` (最小: 1)
  - product_variant_id (必須): integer - 種類ID 例: `1` (最小: 1)
  - quantity (必須): integer - 在庫数 例: `100`

### レスポンス (200)

在庫

- inventory (任意): object
  - id (必須): integer - 在庫ID 例: `1` (最小: 1)
  - warehouse_id (必須): integer - 拠点ID 例: `1` (最小: 1)
  - product_variant (必須): object
  - quantity (必須): integer - 在庫数 例: `1000` (最小: 0)
  - updated_at (必須): string - 最終更新日 例: `2020-12-04T10:09:53.175+09:00`
  - will_pick_quantity (必須): integer - 出荷中数量 例: `2` (最小: 0)
  - not_assigned_quantity (必須): integer - 未割当数量 例: `998` (最小: 0)



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
