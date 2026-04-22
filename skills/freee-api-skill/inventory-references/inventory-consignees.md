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

### レスポンス (200)

出荷先

- consignee (必須): object



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
