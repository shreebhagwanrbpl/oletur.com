import ItemsClient from "@/components/ItemsClient";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function ProductsPage({ city }) {
  const products = await fetchFullCatalog().catch(() => []);

  return <ItemsClient city={city} initialProducts={products} />;
}