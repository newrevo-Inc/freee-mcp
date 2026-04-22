# 入荷

## 概要

入荷の操作

## エンドポイント一覧

### GET /api/v1/receiving_schedules

操作: 入荷予定一覧

説明: 入荷予定一覧

### レスポンス (200)

OK

- receiving_schedules (必須): array[object]

### POST /api/v1/receiving_schedules

操作: 入荷予定作成

### リクエストボディ

(必須)

- receiving_schedule (必須): object

### レスポンス (200)

OK

- receiving_schedule (必須): object

### GET /api/v1/receiving_schedules/{id}

操作: 入荷予定詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷予定ID |

### レスポンス (200)

OK

- receiving_schedule (必須): object

### PUT /api/v1/receiving_schedules/{id}

操作: 入荷予定更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷予定ID |

### リクエストボディ

(必須)

- receiving_schedule (必須): object

### レスポンス (200)

OK

- receiving_schedule (必須): object

### DELETE /api/v1/receiving_schedules/{id}

操作: 入荷予定削除

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷予定ID |

### レスポンス (204)

success

### PUT /api/v1/receiving_schedules/{id}/receive

操作: 入荷確定

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷予定ID |

### レスポンス (200)

OK

- receiving_schedule (任意): object

### GET /api/v1/receiving_histories/{id}

操作: 入荷履歴詳細

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷履歴ID |

### レスポンス (200)

OK

- receiving_history (必須): object

### DELETE /api/v1/receiving_histories/{id}

操作: 入荷履歴削除

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 入荷履歴ID |

### レスポンス (204)

success

### GET /api/v1/receiving_histories

操作: 入荷履歴一覧

説明: 入荷履歴一覧

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| received_date_from | query | いいえ | string(date) | 指定した入荷日以降の履歴が返されます |
| received_date_to | query | いいえ | string(date) | 指定した入荷日以前の履歴が返されます |

### レスポンス (200)

OK

- receiving_histories (必須): array[object]

### POST /api/v1/receiving_histories

操作: 入荷履歴作成

### リクエストボディ

(必須)

- receiving_history (必須): object

### レスポンス (200)

OK

- receiving_history (必須): object



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
