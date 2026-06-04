import { AlbumRaterPage } from "@/components/album-rater-page";

export default function AlbumRoute({
  params,
}: {
  params: { collectionId: string };
}) {
  return <AlbumRaterPage collectionId={params.collectionId} />;
}
