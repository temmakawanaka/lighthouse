"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { safeReturnHref } from "@/lib/query-params";

function FilteredBackLink() {
  const params = useSearchParams();
  return <BackLink href={safeReturnHref(params.get("from"))} />;
}

export function BackToListLink() {
  return <Suspense fallback={<BackLink href="/" />}><FilteredBackLink /></Suspense>;
}

function BackLink({ href }: { href: string }) {
  return (
    <Link className="back-link" href={href}>
      <span aria-hidden="true">←</span>
      一覧へ戻る
    </Link>
  );
}
