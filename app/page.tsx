import { DiscoveryPage } from "@/components/discovery-page";
import { FEATURED_COLLECTION_IDS } from "@/lib/constants";
import { lookupCollectionsSafe } from "@/lib/itunes";

export const revalidate = 300;

export default async function Home() {
  const initialFeatured = await lookupCollectionsSafe([
    ...FEATURED_COLLECTION_IDS,
  ]);
  return <DiscoveryPage initialFeatured={initialFeatured} />;
}
