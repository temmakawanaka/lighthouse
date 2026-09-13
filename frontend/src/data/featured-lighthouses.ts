import type { Lighthouse } from "@/types/lighthouse";

type Featured = Pick<Lighthouse, "name" | "slug" | "description" | "latitude" | "longitude" | "name_kana" | "english_name" | "prefecture" | "municipality" | "address" | "area_name" | "first_lit_date" | "built_year" | "construction_material" | "tower_height_m" | "focal_height_m" | "heritage_status" | "source_urls">;

const records: Featured[] = [
  { name: "宗谷岬灯台", slug: "soyamisaki", description: "日本最北端、宗谷海峡を望む丘に立つ赤白の灯台。晴れた日には海の向こうにサハリンを望む。", latitude: "45.52139", longitude: "141.93639", name_kana: "そうやみさきとうだい", english_name: "Soya Misaki Lighthouse", prefecture: "北海道", municipality: "稚内市", address: "北海道稚内市宗谷岬", area_name: "宗谷岬", first_lit_date: "1885-09-25", built_year: 1885, construction_material: "コンクリート造", tower_height_m: "17.00", focal_height_m: "40.00", heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://ja.wikipedia.org/wiki/%E5%AE%97%E8%B0%B7%E5%B2%AC%E7%81%AF%E5%8F%B0"] },
  { name: "稚内灯台", slug: "wakkanai", description: "ノシャップ岬に立つ赤白の灯台。塔高約43mで、北海道で最も高い灯台として知られる。", latitude: "45.449522", longitude: "141.645158", name_kana: "わっかないとうだい", english_name: "Wakkanai Lighthouse", prefecture: "北海道", municipality: "稚内市", address: "北海道稚内市ノシャップ", area_name: "ノシャップ岬", first_lit_date: "1900-12-10", built_year: 1900, construction_material: "コンクリート造", tower_height_m: "42.70", focal_height_m: "42.10", heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.kaiho.mlit.go.jp/01kanku/wakkanai/mein-topics/hoanbu-topics/180515_wakkanitoudai/index.html"] },
  { name: "納沙布岬灯台", slug: "nosappumisaki", description: "北海道本島の最東端に立つ白亜の灯台。歯舞群島を望む、朝日の早い岬に位置する。", latitude: "43.385194", longitude: "145.816828", name_kana: "のさっぷみさきとうだい", english_name: "Nosappu Misaki Lighthouse", prefecture: "北海道", municipality: "根室市", address: "北海道根室市納沙布", area_name: "納沙布岬", first_lit_date: "1872-08-15", built_year: 1872, construction_material: "コンクリート造", tower_height_m: "13.50", focal_height_m: "23.20", heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.kaiho.mlit.go.jp/01kanku/kushiro/uminoanzen/nosappu.html"] },
  { name: "襟裳岬灯台", slug: "erimomisaki", description: "強い風で知られる襟裳岬の先端に立ち、太平洋へ続く岩礁と岬の広がりを見渡す灯台。", latitude: "41.92583", longitude: "143.24389", name_kana: "えりもみさきとうだい", english_name: "Erimo Misaki Lighthouse", prefecture: "北海道", municipality: "幌泉郡えりも町", address: "北海道幌泉郡えりも町えりも岬", area_name: "襟裳岬", first_lit_date: "1889-06-25", built_year: 1889, construction_material: "コンクリート造", tower_height_m: "13.70", focal_height_m: "73.30", heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.town.erimo.lg.jp/kankou/pages/kankou6.html"] },
  { name: "龍飛埼灯台", slug: "tappisaki", description: "津軽半島の北端、海抜約119mの高台から津軽海峡と北海道を望む白亜の灯台。", latitude: "41.25833", longitude: "140.34250", name_kana: "たっぴさきとうだい", english_name: "Tappi Saki Lighthouse", prefecture: "青森県", municipality: "東津軽郡外ヶ浜町", address: "青森県東津軽郡外ヶ浜町三厩龍浜", area_name: "龍飛崎", first_lit_date: "1932-07-01", built_year: 1932, construction_material: "コンクリート造", tower_height_m: "13.72", focal_height_m: "119.00", heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://ja.wikipedia.org/wiki/%E9%BE%8D%E9%A3%9B%E5%9F%BC%E7%81%AF%E5%8F%B0"] },
  { name: "石廊埼灯台", slug: "irozaki", description: "伊豆半島最南端の断崖に立ち、相模灘と遠州灘の境を照らす灯台。岬の遊歩道から訪ねられる。", latitude: "34.602778", longitude: "138.845278", name_kana: "いろうざきとうだい", english_name: "Irozaki Lighthouse", prefecture: "静岡県", municipality: "賀茂郡南伊豆町", address: "静岡県賀茂郡南伊豆町石廊崎", area_name: "石廊崎", first_lit_date: "1871-08-21", built_year: 1871, construction_material: "コンクリート造", tower_height_m: "11.38", focal_height_m: null, heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.town.minamiizu.shizuoka.jp/docs/2013031300219/"] },
  { name: "伊良湖岬灯台", slug: "iragomisaki", description: "渥美半島の先端で、太平洋と伊勢湾を行き交う船を見守る白亜の灯台。夕景でも知られる。", latitude: "34.57944", longitude: "137.01611", name_kana: "いらごみさきとうだい", english_name: "Irago Misaki Lighthouse", prefecture: "愛知県", municipality: "田原市", address: "愛知県田原市伊良湖町古山", area_name: "伊良湖岬", first_lit_date: "1929-11-20", built_year: 1929, construction_material: "コンクリート造", tower_height_m: "15.50", focal_height_m: null, heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.city.tahara.aichi.jp/kankou/kankou/1003158.html"] },
  { name: "禄剛埼灯台", slug: "rokkosaki", description: "能登半島の先端、狼煙の丘に立つ明治期の石造灯台。海から昇る朝日と沈む夕日を望む。", latitude: "37.52889", longitude: "137.32639", name_kana: "ろっこうさきとうだい", english_name: "Rokkosaki Lighthouse", prefecture: "石川県", municipality: "珠洲市", address: "石川県珠洲市狼煙町イ-51", area_name: "禄剛崎", first_lit_date: "1883-07-10", built_year: 1883, construction_material: "石造", tower_height_m: "12.00", focal_height_m: "48.00", heritage_status: "保存灯台Aランク", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.tokokai.org/history/history14/"] },
  { name: "経ヶ岬灯台", slug: "kyogamisaki", description: "丹後半島の最北端に立つ石造灯台。日本海を望む遊歩道の先に、第一等レンズを備えた姿が残る。", latitude: "35.773333", longitude: "135.226667", name_kana: "きょうがみさきとうだい", english_name: "Kyogamisaki Lighthouse", prefecture: "京都府", municipality: "京丹後市", address: "京都府京丹後市丹後町袖志", area_name: "経ヶ岬", first_lit_date: "1898-12-25", built_year: 1898, construction_material: "石造", tower_height_m: "13.70", focal_height_m: null, heritage_status: "重要文化財", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.bunka.go.jp/kindai/todai/009/index.html"] },
  { name: "美保関灯台", slug: "mihonoseki", description: "島根半島の東端に立つ山陰最古の石造灯台。晴れた日には日本海の先に隠岐や大山を望む。", latitude: "35.56750", longitude: "133.32528", name_kana: "みほのせきとうだい", english_name: "Mihonoseki Lighthouse", prefecture: "島根県", municipality: "松江市", address: "島根県松江市美保関町美保関1338-17", area_name: "地蔵崎", first_lit_date: "1898-11-08", built_year: 1898, construction_material: "石造", tower_height_m: "14.00", focal_height_m: "82.91", heritage_status: "重要文化財", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.bunka.go.jp/kindai/todai/012/index.html"] },
  { name: "男木島灯台", slug: "ogishima", description: "瀬戸内海の男木島北端に立つ、御影石を積んだ無塗装の灯台。港から島道を歩いて訪ねられる。", latitude: "34.433750", longitude: "134.060694", name_kana: "おぎしまとうだい", english_name: "Ogishima Lighthouse", prefecture: "香川県", municipality: "高松市", address: "香川県高松市男木町1064", area_name: "男木島", first_lit_date: "1895-12-10", built_year: 1895, construction_material: "石造", tower_height_m: "14.17", focal_height_m: "15.70", heritage_status: "登録有形文化財", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.kaiho.mlit.go.jp/06kanku/mobile/toudai/ogisima.htm"] },
  { name: "佐田岬灯台", slug: "sadamisaki", description: "四国最西端、豊予海峡を見渡す岬の先端に立つ灯台。駐車場から遊歩道を歩いた先にある。", latitude: "33.343216", longitude: "132.015339", name_kana: "さだみさきとうだい", english_name: "Sada Misaki Lighthouse", prefecture: "愛媛県", municipality: "西宇和郡伊方町", address: "愛媛県西宇和郡伊方町正野", area_name: "佐田岬", first_lit_date: "1918-04-01", built_year: 1918, construction_material: "コンクリート造", tower_height_m: "18.00", focal_height_m: null, heritage_status: "登録有形文化財", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.bunka.go.jp/kindai/todai/026/index.html"] },
  { name: "室戸岬灯台", slug: "murotomisaki", description: "室戸岬の標高約151mに立つ鉄造灯台。国内最大級の第一等フレネルレンズが太平洋を照らす。", latitude: "33.247222", longitude: "134.175556", name_kana: "むろとみさきとうだい", english_name: "Muroto Misaki Lighthouse", prefecture: "高知県", municipality: "室戸市", address: "高知県室戸市室戸岬町", area_name: "室戸岬", first_lit_date: "1899-04-01", built_year: 1899, construction_material: "鉄造", tower_height_m: "15.40", focal_height_m: "154.70", heritage_status: "保存灯台Aランク", source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.kaiho.mlit.go.jp/05kanku/kochi/01_news/muroto.html"] },
  { name: "足摺岬灯台", slug: "ashizurimisaki", description: "四国最南端の断崖に立つ白亜の灯台。足摺宇和海国立公園の太平洋を270度の視界で望む。", latitude: "32.725000", longitude: "133.018889", name_kana: "あしずりみさきとうだい", english_name: "Ashizuri Misaki Lighthouse", prefecture: "高知県", municipality: "土佐清水市", address: "高知県土佐清水市足摺岬", area_name: "足摺岬", first_lit_date: "1914-04-01", built_year: 1914, construction_material: "コンクリート造", tower_height_m: "18.00", focal_height_m: null, heritage_status: null, source_urls: ["https://www.tokokai.org/lighthouse/list50/", "https://www.city.tosashimizu.kochi.jp/kanko/g01_ashizurimisaki.html"] },
];

export const featuredLighthouses: Lighthouse[] = records.map((record) => ({
  id: record.slug,
  ...record,
  country_code: "JP",
  jcg_number: null,
  admiralty_number: null,
  operator: "海上保安庁",
  tower_shape: "塔形",
  marking: null,
  lens: null,
  light_characteristic: null,
  intensity_cd: null,
  range_nm: null,
  range_km: null,
  is_visitable: false,
  visit_info: null,
  admission_info: null,
  closed_info: null,
  parking_info: null,
  phone_number: null,
  selections: ["日本の灯台50選"],
  source_notes: "燈光会「日本の灯台50選」と、海上保安庁・文化庁・自治体等の公開情報をもとに作成。内部参観を常時行う灯台ではありません。",
  is_active: true,
  created_at: "",
  updated_at: "",
}));
