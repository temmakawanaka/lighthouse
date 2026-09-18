"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "探す", icon: "⌕" },
  { href: "/map/", label: "地図", icon: "⌖" },
  { href: "/stamps/", label: "スタンプ", icon: "印" },
  { href: "/trip/", label: "旅程", icon: "旅" },
  { href: "/my-lighthouses/", label: "マイ灯台", icon: "☆" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return <nav className="mobile-nav" aria-label="スマートフォン用ナビゲーション">
    {items.map((item) => {
      const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
      return <Link href={item.href} aria-current={active ? "page" : undefined} key={item.href}>
        <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
      </Link>;
    })}
  </nav>;
}
