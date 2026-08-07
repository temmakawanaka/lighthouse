import { loadLighthouse } from "./load-lighthouse";

type LighthouseDetailLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>;

export default async function LighthouseDetailLayout({
  children,
  params,
}: LighthouseDetailLayoutProps) {
  const { slug } = await params;

  // Resolve a missing lighthouse before the segment's loading boundary starts
  // streaming, so notFound() can preserve the HTTP 404 status.
  await loadLighthouse(slug);

  return children;
}
