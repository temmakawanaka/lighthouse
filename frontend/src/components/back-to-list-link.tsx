import Link from "next/link";

export function BackToListLink() {
  return (
    <Link className="back-link" href="/">
      <span aria-hidden="true">←</span>
      一覧へ戻る
    </Link>
  );
}
