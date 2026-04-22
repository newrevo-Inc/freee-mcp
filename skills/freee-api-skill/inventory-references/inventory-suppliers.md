# 仕入先

## 概要

仕入先の操作

## エンドポイント一覧

### GET /api/v1/suppliers

操作: 仕入先一覧

説明: 仕入先一覧

### レスポンス (200)

OK

- suppliers (必須): array[object]

### POST /api/v1/suppliers

操作: 仕入先作成

### リクエストボディ

(必須)

- supplier (必須): object

### レスポンス (200)

仕入先

- consignee (任意): object

### PUT /api/v1/suppliers/{id}

操作: 仕入先更新

### パラメータ

| 名前 | 位置 | 必須 | 型 | 説明 |
|------|------|------|-----|------|
| id | path | はい | object | 仕入先ID |

### リクエストボディ

(必須)

- supplier (必須): object

### レスポンス (200)

仕入先

- consignee (任意): object



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
