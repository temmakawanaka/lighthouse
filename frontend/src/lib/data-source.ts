// Explicit API configuration preserves existing deployments. Never mask an API error with sample data.
export function usesCatalog(): boolean {
  const source = process.env.LIGHTHOUSE_DATA_SOURCE;
  if (source && source !== "catalog" && source !== "api") throw new Error("LIGHTHOUSE_DATA_SOURCE must be catalog or api.");
  return source ? source === "catalog" : !(process.env.LIGHTHOUSE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL);
}
