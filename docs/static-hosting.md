# 常駐サーバーを使わない公開構成

## 動かす

Node.js 24で、リポジトリの `frontend` ディレクトリから実行する。

```bash
npm ci
npm run dev
```

初期設定では16基のカタログを同梱するため、API・PostgreSQL・Dockerは不要。既存の `.env.local` にAPI接続先を設定している場合は `LIGHTHOUSE_DATA_SOURCE=catalog` と明示する。

## 静的ファイルを作る

```bash
npm run test:static
npm run preview:static
```

`out/` に一覧・全16基の詳細・404・JavaScript・CSS・写真が生成される。プレビューは `http://127.0.0.1:3000`。静的版はブラウザで検索を行い、条件はURLに残る。JavaScript無効時も初期一覧と詳細を読めるが、条件変更にはJavaScriptが必要。

`build:static` は環境変数のAPI接続先にかかわらず同梱データを利用する。通常の `build` はサーバー版で、`LIGHTHOUSE_DATA_SOURCE=api` と `LIGHTHOUSE_API_BASE_URL` による従来のAPI接続も維持する。両モードは同じ `.next/` を使用するため並行ビルドしない。

## AWSの構成

`infra/aws-static.yaml` はS3、CloudFront、Origin Access Control、URL補完用のCloudFront Functionを定義する。S3は非公開でCloudFrontからだけ読み取れる。閲覧URLはCloudFront標準のHTTPSドメインとなり、独自ドメインは不要。

S3の保存量・リクエスト・配信・Function実行等の利用量に応じた費用があり、完全な0円を保証する構成ではない。RDS・Fargate・NAT Gateway等の常時稼働リソースは使わない。実際の料金・無料枠は公開時のアカウント条件を確認する。

テンプレートの作成だけではリソースは作られない。公開する段階でAWS CLIの認証と料金の確認を済ませ、次を実行する。スタック名は `lighthouse-static` のような短い名前を使う。

```bash
aws cloudformation deploy --template-file infra/aws-static.yaml --stack-name lighthouse-static --region ap-northeast-1
aws cloudformation describe-stacks --stack-name lighthouse-static --region ap-northeast-1 --query 'Stacks[0].Outputs'
```

出力されたBucketNameに `frontend/out/` の内容をアップロードする。まずハッシュ付きの静的資産、その後にHTMLやRSCデータをアップロードする。バケット名とDistributionIdは上の実行結果を使用する。

```bash
aws s3 sync frontend/out/_next/static/ s3://BUCKET_NAME/_next/static/ --cache-control 'public,max-age=31536000,immutable'
aws s3 sync frontend/out/ s3://BUCKET_NAME/ --exclude '_next/static/*' --cache-control 'public,max-age=0,must-revalidate'
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths '/*'
```

旧資産を消さずに配信するため、更新時に `--delete` は付けない。CloudFrontの反映後、ルート・16基の詳細直リンク・検索条件URL・存在しないURLのHTTP 404を確認する。CloudFormationのバケットは誤削除防止のためRetainを指定しているので、運用を止める際のストレージの扱いは別途判断する。

検索条件はブラウザで処理するため、CDNのキャッシュキーには含めない。拡張子のないURLと末尾 `/` のURLを `index.html` に補完し、存在しないURLには `/404.html` をHTTP 404で返す。すべてのURLをトップに返すSPA用の200リライトは設定しない。

Amplify等を使う場合も静的な `out/` 全体を配信する。実行環境、認証、DBの追加はこの閲覧用途には必要ない。

## データの更新

1. 燈光会の各灯台の個別ページで参観時間・受付締切・料金・休止案内を確認する。
2. `backend/app/db/seeds/lighthouses.json` を修正する。
3. `frontend/src/data/visit-reviews.json` の該当灯台に確認日・出典・日付付きの休止案内を記録する。未確認の灯台の確認日は変更しない。
4. `frontend` で `npm run sync:catalog`、`npm test`、`npm run test:static` を実行する。
5. GitHubで変更をレビューし、静的ファイルを再配信する。API版にも反映する場合は既存のseed更新手順を実施する。

今回の参観情報確認日は2026年9月9日。確認日は参観時間・料金・休止案内・連絡先に限定し、歴史・建設年等の全項目を再検証した日ではない。

## 参考

- [Next.js公式：Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [AWS公式：S3へのアクセスをCloudFrontに制限](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [AWS公式：ディレクトリURLへindex.htmlを補完](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html)
- [燈光会：のぼれる灯台16](https://www.tokokai.org/tourlight/)
