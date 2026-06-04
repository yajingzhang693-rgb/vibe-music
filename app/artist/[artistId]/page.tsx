import { ArtistPage } from "@/components/artist-page";

export default function ArtistRoute({
  params,
}: {
  params: { artistId: string };
}) {
  return <ArtistPage artistId={params.artistId} />;
}
