import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 8000;

function lighthouse(index, overrides) {
  return {
    id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`,
    name: `テスト灯台${index}`,
    slug: `test-lighthouse-${index}`,
    description: `E2Eテスト用の灯台情報 ${index}`,
    latitude: String(33 + index / 10),
    longitude: String(130 + index / 10),
    name_kana: `てすととうだい${index}`,
    english_name: `Test Lighthouse ${index}`,
    country_code: "JP",
    prefecture: "静岡県",
    municipality: "浜松市",
    address: `静岡県浜松市テスト町${index}`,
    area_name: null,
    jcg_number: null,
    admiralty_number: null,
    operator: "海上保安庁",
    first_lit_date: `${1900 + index}-01-01`,
    built_year: 1900 + index,
    construction_material: "コンクリート造",
    tower_shape: "塔形",
    marking: "白色",
    lens: null,
    light_characteristic: "単せん白光",
    intensity_cd: 100000 + index,
    range_nm: "18.00",
    range_km: "33.00",
    tower_height_m: "20.00",
    focal_height_m: "40.00",
    is_visitable: index % 2 === 0,
    visit_info: index % 2 === 0 ? "通年参観できます。" : null,
    admission_info: null,
    closed_info: null,
    parking_info: null,
    phone_number: null,
    heritage_status: null,
    selections: index % 2 === 0 ? ["のぼれる灯台16"] : [],
    source_urls: ["https://example.com/lighthouse"],
    source_notes: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const lighthouses = [
  lighthouse(1, {
    name: "犬吠埼灯台",
    slug: "inubosaki",
    name_kana: "いぬぼうさきとうだい",
    english_name: "Inubosaki Lighthouse",
    prefecture: "千葉県",
    municipality: "銚子市",
    address: "千葉県銚子市犬吠埼9576",
    first_lit_date: "1874-11-15",
    built_year: 1874,
    is_visitable: true,
    visit_info: "通年参観できます。",
    selections: ["のぼれる灯台16"],
  }),
  lighthouse(2, {
    name: "飯岡灯台",
    slug: "iioka",
    prefecture: "千葉県",
    municipality: "旭市",
    is_visitable: false,
    visit_info: null,
    selections: [],
  }),
  lighthouse(3, {
    name: "野島埼灯台",
    slug: "nojimasaki",
    prefecture: "千葉県",
    municipality: "南房総市",
    is_visitable: true,
    visit_info: "参観できます。",
    selections: ["のぼれる灯台16"],
  }),
  lighthouse(4, {
    name: "観音埼灯台",
    slug: "kannonzaki",
    prefecture: "神奈川県",
    municipality: "横須賀市",
    is_visitable: true,
  }),
  lighthouse(5, { name: "御前埼灯台", slug: "omaesaki", prefecture: "静岡県" }),
  lighthouse(6, { name: "伊良湖岬灯台", slug: "iragomisaki", prefecture: "愛知県" }),
  lighthouse(7, { name: "潮岬灯台", slug: "shionomisaki", prefecture: "和歌山県" }),
  lighthouse(8, { name: "出雲日御碕灯台", slug: "izumo-hinomisaki", prefecture: "島根県" }),
  lighthouse(9, { name: "角島灯台", slug: "tsunoshima", prefecture: "山口県" }),
  lighthouse(10, { name: "室戸岬灯台", slug: "murotomisaki", prefecture: "高知県" }),
  lighthouse(11, { name: "佐田岬灯台", slug: "sadamisaki", prefecture: "愛媛県" }),
  lighthouse(12, { name: "都井岬灯台", slug: "toimisaki", prefecture: "宮崎県" }),
  lighthouse(13, { name: "残波岬灯台", slug: "zanpamisaki", prefecture: "沖縄県" }),
  lighthouse(14, { name: "尻屋埼灯台", slug: "shiriyazaki", prefecture: "青森県" }),
  lighthouse(15, { name: "宗谷岬灯台", slug: "soyamisaki", prefecture: "北海道" }),
];

function json(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function compareLighthouses(sortBy, sortOrder) {
  const direction = sortOrder === "desc" ? -1 : 1;

  return (left, right) => {
    const first = String(left[sortBy] ?? "").localeCompare(String(right[sortBy] ?? ""), "ja");
    if (first !== 0) return first * direction;
    return left.name.localeCompare(right.name, "ja") * direction;
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);

  if (url.pathname === "/health") {
    json(response, 200, { status: "ok" });
    return;
  }

  if (url.pathname === "/api/v1/lighthouses") {
    await delay(180);

    const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase("ja");
    if (query === "api-error") {
      json(response, 500, { detail: "Intentional E2E error" });
      return;
    }

    const prefecture = url.searchParams.get("prefecture");
    const visitableOnly = url.searchParams.get("is_visitable") === "true";
    const sortBy = url.searchParams.get("sort_by") ?? "prefecture";
    const sortOrder = url.searchParams.get("sort_order") ?? "asc";
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "12", 10);
    const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);

    const filtered = lighthouses
      .filter((item) => {
        if (prefecture && item.prefecture !== prefecture) return false;
        if (visitableOnly && !item.is_visitable) return false;
        if (!query) return true;

        return [item.name, item.name_kana, item.prefecture, item.municipality]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase("ja").includes(query));
      })
      .sort(compareLighthouses(sortBy, sortOrder));

    json(response, 200, {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      limit,
      offset,
      has_more: offset + limit < filtered.length,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    return;
  }

  const detailMatch = url.pathname.match(/^\/api\/v1\/lighthouses\/slug\/([^/]+)$/);
  if (detailMatch) {
    await delay(80);
    const slug = decodeURIComponent(detailMatch[1]);
    const item = lighthouses.find((candidate) => candidate.slug === slug);
    json(response, item ? 200 : 404, item ?? { detail: "Lighthouse not found" });
    return;
  }

  json(response, 404, { detail: "Not found" });
});

server.listen(port, host, () => {
  console.log(`Mock lighthouse API listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
