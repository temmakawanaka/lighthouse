import type { StampRecord } from "@/components/lighthouse-status-provider";
import { getCheckInTarget } from "./check-in";
import { catalog } from "./catalog";
import { getLighthouseRegion, LIGHTHOUSE_REGIONS } from "./regions";

type Stamps = Record<string, StampRecord>;

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("画像を作成できませんでした。")), "image/png"));
}

export async function createStampBookImage(stamps: Stamps) {
  const testCount = Object.values(stamps).filter((stamp) => stamp.source === "test").length;
  const earned = catalog
    .filter((item) => stamps[item.slug])
    .sort((a, b) => stamps[b.slug].obtainedAt.localeCompare(stamps[a.slug].obtainedAt));
  const columns = 4;
  const rows = Math.max(1, Math.ceil(earned.length / columns));
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 690 + rows * 190;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像を作成できませんでした。");

  context.fillStyle = "#f7f1e8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#102c34";
  context.fillRect(0, 0, canvas.width, 310);
  context.fillStyle = "#e8a99b";
  context.font = "700 25px Georgia, serif";
  context.fillText("LIGHTHOUSE STAMP BOOK", 72, 78);
  if (testCount > 0) {
    context.textAlign = "right";
    context.fillText(`TEST MODE・確認用 ${testCount}基`, 1128, 78);
    context.textAlign = "left";
  }
  context.fillStyle = "#ffffff";
  context.font = "500 62px Georgia, 'Yu Mincho', serif";
  context.fillText("灯台スタンプ帳", 72, 155);
  context.font = "500 72px Georgia, serif";
  context.fillText(`${earned.length} / ${catalog.length}`, 72, 250);
  context.font = "500 25px sans-serif";
  context.fillStyle = "rgba(255,255,255,.75)";
  context.fillText(`収集率 ${Math.round(earned.length / catalog.length * 100)}%`, 440, 245);
  context.textAlign = "right";
  context.fillText(new Date().toLocaleDateString("ja-JP"), 1128, 245);
  context.textAlign = "left";

  context.fillStyle = "#a63f34";
  context.font = "700 23px Georgia, serif";
  context.fillText("REGIONAL COLLECTION", 72, 368);
  LIGHTHOUSE_REGIONS.forEach((region, index) => {
    const records = catalog.filter((item) => getLighthouseRegion(item.prefecture) === region.name);
    const count = records.filter((item) => stamps[item.slug]).length;
    const x = 72 + index % 4 * 268;
    const y = 400 + Math.floor(index / 4) * 82;
    context.strokeStyle = count === records.length ? "#2e6973" : "#aab5b5";
    context.lineWidth = count === records.length ? 3 : 1;
    context.strokeRect(x, y, 244, 58);
    context.fillStyle = count === records.length ? "#2e6973" : "#102c34";
    context.font = "700 22px sans-serif";
    context.fillText(region.name, x + 14, y + 27);
    context.font = "500 18px sans-serif";
    context.fillText(`${count} / ${records.length}基${count === records.length ? "  制覇" : ""}`, x + 14, y + 49);
  });

  context.fillStyle = "#102c34";
  context.font = "500 34px Georgia, 'Yu Mincho', serif";
  context.fillText(earned.length ? "獲得した灯台" : "最初の灯台を訪ねよう", 72, 610);
  const cellWidth = 264;
  const startY = 665;
  earned.forEach((lighthouse, index) => {
    const stamp = stamps[lighthouse.slug];
    const viewpoint = getCheckInTarget(lighthouse).kind === "viewpoint";
    const x = 72 + index % columns * cellWidth;
    const y = startY + Math.floor(index / columns) * 190;
    const centerX = x + 116;
    const centerY = y + 62;
    const color = viewpoint ? "#2e6973" : "#a63f34";
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(centerX, centerY, 57, 0, Math.PI * 2);
    context.stroke();
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, centerY, 49, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = color;
    context.textAlign = "center";
    context.font = "700 17px Georgia, 'Yu Mincho', serif";
    context.fillText(lighthouse.prefecture?.replace(/[都府県]$/, "") ?? "日本", centerX, centerY - 24);
    context.font = "500 48px Georgia, 'Yu Mincho', serif";
    context.fillText(viewpoint ? "望" : "灯", centerX, centerY + 21);
    context.font = "500 15px sans-serif";
    context.fillText(new Date(stamp.obtainedAt).toLocaleDateString("ja-JP"), centerX, centerY + 43);
    context.fillStyle = "#102c34";
    context.font = "700 19px sans-serif";
    context.fillText(lighthouse.name.length > 11 ? `${lighthouse.name.slice(0, 10)}…` : lighthouse.name, centerX, y + 145);
    context.fillStyle = "#526a70";
    context.font = "500 15px sans-serif";
    context.fillText(viewpoint ? "遠望スタンプ" : `${getLighthouseRegion(lighthouse.prefecture)}・現地`, centerX, y + 170);
  });
  context.textAlign = "left";
  context.fillStyle = "#526a70";
  context.font = "500 17px sans-serif";
  context.fillText(`灯台アプリ｜GPSで集める灯台スタンプラリー${testCount > 0 ? "｜テスト印を含みます" : ""}`, 72, canvas.height - 28);

  const blob = await canvasBlob(canvas);
  return new File([blob], `灯台スタンプ帳-${new Date().toISOString().slice(0, 10)}.png`, { type: "image/png" });
}

export async function shareOrDownloadStampBook(stamps: Stamps) {
  const file = await createStampBookImage(stamps);
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: "灯台スタンプ帳", text: `灯台スタンプを${Object.keys(stamps).length}基集めました。`, files: [file] });
    return "shared" as const;
  }
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded" as const;
}
