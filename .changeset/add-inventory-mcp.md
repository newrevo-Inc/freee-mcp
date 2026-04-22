---
"freee-mcp": minor
---

feat: ロジクラ（将来の freee 在庫管理）API と連携する `freee-inventory-mcp` コマンドを追加。

- `npx --package=freee-mcp -- freee-inventory-mcp configure` で対話式セットアップ
- `npx --package=freee-mcp -- freee-inventory-mcp` で MCP サーバー起動
- OAuth2 (`read write`) による認証、パス `/api/v{n}/` のバージョン可変対応
- ロジクラ独自の 429/499 レートリミット応答をハンドリング
- `skills/freee-api-skill/inventory-references/` に API リファレンスを生成
- stdio のみ（Remote モードは後続 PR で対応予定）
