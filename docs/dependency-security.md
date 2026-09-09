# フロントエンド依存関係のセキュリティ運用

## 自動チェック

`.github/workflows/frontend-ci.yml` は、フロントエンドに関係するPull Requestと `main` へのpushで次を個別のチェックとして実行します。

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:static`
- `npm run build`
- `npm run audit:production`

新しい脆弱性をコード変更がない期間にも検出するため、同じワークフローを毎週月曜日の00:00 UTCにも実行します。

## 監査基準

- 本番依存関係に中程度以上の脆弱性がある場合、`npm run audit:production` を失敗させます。
- インストールにはlockfileを利用する `npm ci` を使います。
- `npm audit fix --force` は、フレームワークの破壊的な変更を招く可能性があるため使用しません。
- 更新は、直接依存関係の修正版、フレームワーク側の修正版、または互換性を検証した `overrides` の順に検討します。

## Next.js・PostCSS・sharpの対応

2026年に公開されたNext.jsと開発ツール群のAdvisoryに対応するため、Next.jsを16.3.4、Vitestを4.1.11へ更新しています。推移依存関係もlockfile上で修正版へ更新し、2026-09-09時点の `npm audit` は本番・開発依存とも0件です。

フレームワークが修正版を直接指定しているため、PostCSSやsharpの個別overrideは使用しません。依存関係の更新時は次を確認します。

```bash
cd frontend
npm ci
npm ls next postcss sharp
npm run audit:production
npm run lint
npm run typecheck
npm test
npm run test:static
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
