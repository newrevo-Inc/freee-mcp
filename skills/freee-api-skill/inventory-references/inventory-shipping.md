# 出荷

## 概要

出荷の操作

## エンドポイント一覧

### GET /api/v1/shipping_schedules

操作: 出荷予定一覧

説明: 出荷予定一覧

### レスポンス (200)

OK

- shipping_schedules (必須): array[object]

### POST /api/v1/shipping_schedules

操作: 出荷予定作成

### リクエストボディ

(必須)

- sales_order (必須): object
  - billing_address_id (任意): integer(integer) 例: `1` (最小: 1)
  - shop_id (必須): integer(integer) 例: `1` (最小: 1)
  - order_number (必須): string - 注文番号 例: `A-123456`
  - order_date (必須): object - 注文日
  - shipping_cost (必須): integer - 送料 例: `100`
  - sales_commission (必須): integer - 販売手数料 例: `100`
  - other_cost (必須): integer - その他費用 例: `100`
  - point (必須): integer - ポイント 例: `100`
  - total_price (必須): integer - 総計 例: `100`
  - gift_message (必須): string - ギフトメッセージ 例: `おめでとうございます`
  - gift_enabled (任意): boolean - ギフトフラグ 例: `true`
  - external_service_code (任意): string - 外部連携コード 例: `A-12345`
  - external_service_account (任意): object
- shipping_schedule (必須): object

### レスポンス (200)

OK

- shipping_schedule (任意): object

### PATCH /api/v1/shipping_schedules/{id}/start

操作: 出荷作業開始

### リクエストボディ

(必須)

- warehouse_id (必須): integer - 拠点ID 例: `1` (最小: 1)

### レスポンス (200)

OK

- shipping_schedule (任意): object

### PUT /api/v1/shipping_schedules/{id}/ship

操作: 出荷確定

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷予定ID |

### レスポンス (200)

OK

- shipping_schedule (任意): object

### GET /api/v1/shipping_schedules/{id}

操作: 出荷予定詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷予定ID |

### レスポンス (200)

OK

- shipping_schedule (必須): object - 出荷予定

### PUT /api/v1/shipping_schedules/{id}

操作: 出荷予定更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷予定ID |

### リクエストボディ

(必須)

- sales_order (必須): object
  - billing_address_id (任意): integer(integer) 例: `1` (最小: 1)
  - shop_id (必須): integer(integer) 例: `1` (最小: 1)
  - order_number (必須): string - 注文番号 例: `A-123456`
  - order_date (必須): object - 注文日
  - shipping_cost (必須): integer - 送料 例: `100`
  - sales_commission (必須): integer - 販売手数料 例: `100`
  - other_cost (必須): integer - その他費用 例: `100`
  - point (必須): integer - ポイント 例: `100`
  - total_price (必須): integer - 総計 例: `100`
  - gift_message (必須): string - ギフトメッセージ 例: `おめでとうございます`
  - gift_enabled (任意): boolean - ギフトフラグ 例: `true`
  - external_service_code (任意): string - 外部連携コード 例: `A-12345`
  - external_service_account (任意): object
- shipping_schedule (必須): object

### レスポンス (200)

OK

- shipping_schedule (必須): object - 出荷予定

### DELETE /api/v1/shipping_schedules/{id}

操作: 出荷予定削除

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷予定ID |

### レスポンス (204)

success

### GET /api/v1/shipping_histories/{id}

操作: 出荷履歴詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷履歴ID |

### レスポンス (200)

OK

- shipping_history (必須): object - 出荷履歴

### GET /api/v1/shipping_histories

操作: 出荷履歴一覧

説明: 出荷履歴一覧

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| shipped_date_from | query | いいえ | string(date) | 指定した出荷実績日以降の履歴が返されます |
| shipped_date_to | query | いいえ | string(date) | 指定した出荷実績以前の履歴が返されます |

### レスポンス (200)

OK

- shipping_histories (必須): array[object]

### POST /api/v1/shipping_histories

操作: 出荷履歴作成

### リクエストボディ

(必須)

- sales_order (必須): object
  - billing_address_id (任意): integer(integer) 例: `1` (最小: 1)
  - shop_id (必須): integer(integer) 例: `1` (最小: 1)
  - order_number (必須): string - 注文番号 例: `A-123456`
  - order_date (必須): object - 注文日
  - shipping_cost (必須): integer - 送料 例: `100`
  - sales_commission (必須): integer - 販売手数料 例: `100`
  - other_cost (必須): integer - その他費用 例: `100`
  - point (必須): integer - ポイント 例: `100`
  - total_price (必須): integer - 総計 例: `100`
  - gift_message (必須): string - ギフトメッセージ 例: `おめでとうございます`
  - gift_enabled (任意): boolean - ギフトフラグ 例: `true`
  - external_service_code (任意): string - 外部連携コード 例: `A-12345`
  - external_service_account (任意): object
- shipping_history (必須): object
  - shipping_items (必須): array[object]
  - warehouse_id (必須): object - 拠点ID
  - consignee_id (必須): object - 出荷先ID
  - tracking_number (任意): string - 追跡番号 例: `1234-5678-9012`
  - shipped_date (任意): object - 出荷実績日
  - description (任意): string - 詳細 例: `メモです`

### レスポンス (200)

OK

- shipping_history (必須): object



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
