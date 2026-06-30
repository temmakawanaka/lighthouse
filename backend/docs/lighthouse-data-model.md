# 灯台データモデル設計メモ

## 目的

APIは、灯台レコードを以下の用途で返せるようにします。

- 地図、一覧、詳細画面
- 歴史・文化的な説明
- 航路標識としての諸元
- 参観可能な灯台や公開灯台の利用情報
- 手作業で整備したデータの出典管理

## 初期サンプルの出典

最初のseedデータでは、燈光会と海上保安庁の公開ページをもとに、通年で参観できる「のぼれる灯台16」全件を採用しています。

- 尻屋埼灯台
- 入道埼灯台
- 塩屋埼灯台
- 犬吠埼灯台
- 野島埼灯台
- 観音埼灯台
- 初島灯台
- 御前埼灯台
- 安乗埼灯台
- 大王埼灯台
- 潮岬灯台
- 角島灯台
- 出雲日御碕灯台
- 都井岬灯台
- 残波岬灯台
- 平安名埼灯台

本番品質のデータ整備では、出典の優先度を以下の順にします。

1. 海上保安庁のページ、告示、公式資料
2. 自治体や都道府県の観光ページ
3. 参観灯台や歴史的灯台を扱う燈光会ページ
4. 一次情報が見つからない場合の補助情報としてのWikipediaなど

## 確定したデータ群

### 識別情報

- `name`
- `slug`
- `name_kana`
- `english_name`
- `description`

### 所在地

- `country_code`
- `prefecture`
- `municipality`
- `address`
- `area_name`
- `latitude`
- `longitude`

緯度・経度は現時点ではdecimalで保持します。半径検索、ルート検索、地図クラスタリングが重要になった段階でPostGISを追加します。公開APIの形はそのまま維持できます。

### 航路標識としての諸元

- `jcg_number`
- `admiralty_number`
- `operator`
- `first_lit_date`
- `built_year`
- `construction_material`
- `tower_shape`
- `marking`
- `lens`
- `light_characteristic`
- `intensity_cd`
- `range_nm`
- `range_km`
- `tower_height_m`
- `focal_height_m`

これらは公開されている灯台情報で繰り返し登場し、詳細画面、絞り込み、比較表示で使いやすい項目です。

### 参観・観光情報

- `is_visitable`
- `visit_info`
- `admission_info`
- `closed_info`
- `parking_info`
- `phone_number`

営業時間や料金は構造諸元より変更されやすいため、最初のバージョンではテキストとして保持します。カレンダー表示や営業日判定が必要になった段階で、正規化したスケジュールテーブルを追加します。

### 文化財・編集ラベル

- `heritage_status`
- `selections`

`selections` はJSONBです。灯台は「日本の灯台50選」「登れる灯台」「世界灯台100選」など複数のリストに所属し得るためです。

### 出典

- `source_urls`
- `source_notes`

手作業で整備した灯台レコードには、少なくとも1つの出典URLを保持します。出典によって値が食い違う場合は、採用した出典と理由を `source_notes` に記録します。

## seed投入コマンド

```powershell
cd backend
.\.venv\Scripts\python.exe -m scripts.seed_lighthouses
```

`alembic upgrade head` のあとに実行します。

## APIの取得パターン

最初に対応する読み取りAPIです。

- `GET /api/v1/lighthouses`
- `GET /api/v1/lighthouses/{id}`
- `GET /api/v1/lighthouses/slug/{slug}`
- `GET /api/v1/lighthouses?q=犬吠埼`
- `GET /api/v1/lighthouses?prefecture=千葉県`
- `GET /api/v1/lighthouses?municipality=銚子市`
- `GET /api/v1/lighthouses?is_visitable=true`
- `GET /api/v1/lighthouses?north=36&south=35&east=141&west=140`
- `GET /api/v1/lighthouses?limit=12&offset=0&sort_by=name&sort_order=asc`

地図範囲検索では `north`、`south`、`east`、`west` の4つを必須にします。一部だけ指定された場合に、意図しない半端な検索結果を返さないためです。

一覧APIは配列をそのまま返すのではなく、フロントエンドでページネーションを扱いやすいレスポンスにします。

```json
{
  "items": [
    {
      "id": 1,
      "name": "犬吠埼灯台",
      "slug": "inubosaki",
      "prefecture": "千葉県"
    }
  ],
  "total": 16,
  "limit": 12,
  "offset": 0,
  "has_more": true,
  "sort_by": "prefecture",
  "sort_order": "asc"
}
```

- `items`: 実際の一覧データ
- `total`: 現在の検索条件に一致する総件数
- `limit` / `offset`: ページング条件の反映値
- `has_more`: 次ページが存在するかどうか
- `sort_by`: `prefecture` / `name` / `first_lit_date` / `created_at`
- `sort_order`: `asc` / `desc`
