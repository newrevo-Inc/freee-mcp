# 拠点

## 概要

拠点の操作

## エンドポイント一覧

### GET /api/v1/warehouses

操作: 拠点一覧

説明: 拠点一覧

### レスポンス (200)

OK

- warehouses (必須): array[object]
  配列の要素:
    - id (任意): integer - 拠点ID 例: `1` (最小: 1)
    - name (任意): string - 拠点名 例: `拠点A`
    - code (任意): string - 拠点コード 例: `WAREHOUSE-01`
    - updated_at (任意): string - 最終更新日 例: `2020-12-04T10:09:53.175+09:00`



## 参考情報

- freee API公式ドキュメント: https://developer.freee.co.jp/docs
