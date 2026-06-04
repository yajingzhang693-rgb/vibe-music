"use client";

import { useListsStore } from "@/store/use-lists-store";
import { useEffect } from "react";

export function ListsHydrator() {
  const hydrate = useListsStore((s) => s.hydrate);
  const hydrated = useListsStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return null;
}
