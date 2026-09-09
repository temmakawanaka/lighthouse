# 写真・地図の出典

16基すべてにWikimedia Commonsで再利用条件を確認した写真を使用する。各詳細ページで作者、原版、ライセンスへのリンクを写真の直下に表示する。機械可読な完全一覧は `frontend/src/data/photo-sources.json` に保持し、カタログの全slugを網羅することを自動テストする。

| 灯台 | 作者 | ライセンス |
| --- | --- | --- |
| 尻屋埼灯台 | くろふね | CC BY-SA 4.0 |
| 入道埼灯台 | 掬茶 | CC BY-SA 4.0 |
| 塩屋埼灯台 | hiroaki | CC BY 2.0 |
| 犬吠埼灯台 | Ippukucho | CC BY 3.0 |
| 野島埼灯台 | Qurren | CC BY-SA 4.0 |
| 観音埼灯台 | 椎林 隆夫 | CC BY-SA 3.0 |
| 初島灯台 | ガウス | CC BY-SA 3.0 |
| 御前埼灯台 | Alpsdake | CC BY-SA 4.0 |
| 安乗埼灯台 | Sashimiteishoku | CC0 1.0 |
| 大王埼灯台 | Alpsdake | CC BY-SA 4.0 |
| 潮岬灯台 | BUNBUN | CC BY-SA 2.1 日本 |
| 角島灯台 | 藤谷良秀 | CC BY-SA 3.0 |
| 出雲日御碕灯台 | Raita Futo | CC BY 2.0 |
| 都井岬灯台 | Vanquish0 | CC BY-SA 3.0 |
| 残波岬灯台 | Kugel | CC BY-SA 4.0 |
| 平安名埼灯台 | Paipateroma | CC BY-SA 4.0 |

Commonsの1280px版を `frontend/public/images/` に同梱して表示する。取得元URLはメタデータに保持し、`npm run sync:photos` で再取得できる。写真ライセンスは各写真にのみ適用され、アプリのソースコード全体のライセンスを変更しない。

日本地図は `@svg-maps/japan` 2.0.0（CC BY 4.0）を使用し、地図画面内に出典とライセンスを表示する。
