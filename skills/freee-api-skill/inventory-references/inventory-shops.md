# ショップ

## 概要

ショップの操作

## エンドポイント一覧

### GET /api/v1/shops

操作: ショップ一覧

説明: 入荷履歴一覧

### レスポンス (200)

OK

- shops (必須): array[object]
  配列の要素:
    - id (必須): integer(integer) 例: `1` (最小: 1)
    - name (必須): string - ショップ名 例: `ロジクラショップ`
    - code (必須): string - ショップコード 例: `LOGIKURA-SHOP`
    - sales_channel_id (必須): integer(integer) - 販売チャネルID(モール/カート) 例: `1` (最小: 1)
    - delivery_method_id (必須): integer(integer) - 配送方法ID 例: `1` (最小: 1)
    - email (必須): string - メールアドレス 例: `test@example.com`
    - phone_number (必須): string - 電話番号 例: `03-6362-4084`
    - address1 (必須): string - 住所1 例: `東京都港区`
    - address2 (必須): string - 住所2 例: `1-1-1 ロジクラビル2F`
    - note (必須): string - 備考 例: `メモです`
    - tax_included (必須): boolean - 税区分
true: 税込み
false: 税抜
 例: `true`
    - image (必須): string - 画像URL 例: `https://logikura.com/images/searching.png`

### POST /api/v1/shops

操作: ショップ作成

### リクエストボディ

(必須)

- shop (必須): object
  - name (必須): string - ショップ名 例: `ロジクラショップ`
  - code (必須): string - ショップコード 例: `LOGIKURA-SHOP`
  - sales_channel_id (必須): integer(integer) - 販売チャネルID(モール/カート) 例: `1` (最小: 1)
  - delivery_method_id (必須): integer(integer) - 配送方法ID 例: `1` (最小: 1)
  - email (必須): string - メールアドレス 例: `test@example.com`
  - phone_number (必須): string - 電話番号 例: `03-6362-4084`
  - address1 (必須): string - 住所1 例: `東京都港区`
  - address2 (必須): string - 住所2 例: `1-1-1 ロジクラビル2F`
  - note (必須): string - 備考 例: `メモです`
  - tax_included (必須): boolean - 税区分
true: 税込み
false: 税抜
 例: `true`

### レスポンス (200)

ショップ

- shop (必須): object
  - id (必須): integer(integer) 例: `1` (最小: 1)
  - name (必須): string - ショップ名 例: `ロジクラショップ`
  - code (必須): string - ショップコード 例: `LOGIKURA-SHOP`
  - sales_channel_id (必須): integer(integer) - 販売チャネルID(モール/カート) 例: `1` (最小: 1)
  - delivery_method_id (必須): integer(integer) - 配送方法ID 例: `1` (最小: 1)
  - email (必須): string - メールアドレス 例: `test@example.com`
  - phone_number (必須): string - 電話番号 例: `03-6362-4084`
  - address1 (必須): string - 住所1 例: `東京都港区`
  - address2 (必須): string - 住所2 例: `1-1-1 ロジクラビル2F`
  - note (必須): string - 備考 例: `メモです`
  - tax_included (必須): boolean - 税区分
true: 税込み
false: 税抜
 例: `true`
  - image (必須): string - 画像URL 例: `https://logikura.com/images/searching.png`



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
