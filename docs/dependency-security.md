# フロントエンド依存関係のセキュリティ運用

## 自動チェック

`.github/workflows/frontend-ci.yml` は、フロントエンドに関係するPull Requestと `main` へのpushで次を個別のチェックとして実行します。

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run audit:production`

新しい脆弱性をコード変更がない期間にも検出するため、同じワークフローを毎週月曜日の00:00 UTCにも実行します。

## 監査基準

- 本番依存関係に中程度以上の脆弱性がある場合、`npm run audit:production` を失敗させます。
- インストールにはlockfileを利用する `npm ci` を使います。
- `npm audit fix --force` は、フレームワークの破壊的な変更を招く可能性があるため使用しません。
- 更新は、直接依存関係の修正版、フレームワーク側の修正版、または互換性を検証した `overrides` の順に検討します。

## Next.js・PostCSS・sharpの対応

2026年7月に公開されたNext.js、PostCSS、sharpのAdvisoryに対応するため、Next.jsを16.3.0へ更新しています。このバージョンは、修正版のPostCSS 8.5.23とsharp 0.35.3を依存関係として採用しています。

フレームワークが修正版を直接指定しているため、PostCSSやsharpの個別overrideは使用しません。依存関係の更新時は次を確認します。

```bash
cd frontend
npm ci
npm ls next postcss sharp
npm run audit:production
npm run lint
npm run typecheck
npm test
npm run build
```

## 一時的な例外

修正版が存在せず直ちに解消できない場合は、監査を無条件に無効化しません。別Issueに次を記録し、そのIssueを参照するPRで期限付きの例外をレビューします。

- Advisory URLと深刻度
- アプリケーションで影響を受ける経路
- 回避策と残存リスク
- 対応担当者
- 30日以内の見直し期限

期限を迎える前に、依存関係の更新または例外の再評価を行います。
