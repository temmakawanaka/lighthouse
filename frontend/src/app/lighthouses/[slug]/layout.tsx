import { loadLighthouse } from "./load-lighthouse";
import { connection } from "next/server";

type LighthouseDetailLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>;

export default async function LighthouseDetailLayout({
  children,
  params,
}: LighthouseDetailLayoutProps) {
  if (process.env.LIGHTHOUSE_STATIC_EXPORT !== "true") await connection();
  const { slug } = await params;

  // Resolve a missing lighthouse before the segment's loading boundary starts
  // streaming, so notFound() can preserve the HTTP 404 status.
  await loadLighthouse(slug);

  return children;
}
