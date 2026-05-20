# 出荷先

## 概要

出荷先の操作

## エンドポイント一覧

### GET /api/v1/consignees

操作: 出荷先一覧

説明: 出荷先一覧

### レスポンス (200)

OK

- consignees (必須): array[object]

### POST /api/v1/consignees

操作: 出荷先作成

### リクエストボディ

(必須)

- consignee (必須): object

### レスポンス (200)

出荷先

- consignee (必須): object

### PUT /api/v1/consignees/{id}

操作: 出荷先更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 出荷先ID |

### リクエストボディ

(必須)

- consignee (必須): object
  - code (任意): string - コード 例: `code`
  - name (任意): string - 名称 例: `name`
  - email (任意): string - メールアドレス 例: `text@example.com`
  - phone_number (任意): string - 電話番号 例: `0300000000`
  - postal_code (任意): string - 郵便番号 例: `0000000`
  - address1 (任意): string - 住所1 例: `東京都ロジクラ区`
  - address2 (任意): string - 住所2 例: `ロジクラ1-1-1`
  - description (任意): string - 詳細 例: `詳細`

### レスポンス (200)

出荷先

- consignee (必須): object



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
