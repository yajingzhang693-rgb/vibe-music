import { ListEditorPage } from "@/components/list-editor-page";

export default function ListEditorRoute({
  params,
}: {
  params: { listId: string };
}) {
  return <ListEditorPage listId={params.listId} />;
}
