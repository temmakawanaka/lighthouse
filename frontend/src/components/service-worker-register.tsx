"use client";

import { useEffect } from "react";
import { SITE_BASE_PATH, sitePath } from "@/lib/site-path";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(sitePath("/sw.js"), { scope: `${SITE_BASE_PATH || ""}/` }).catch(() => undefined);
    }
  }, []);
  return null;
}
