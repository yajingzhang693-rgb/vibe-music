"use client";

import { getOrCreateVisitorId } from "@/lib/fingerprint";
import { useEffect, useState } from "react";

export function useFingerprint(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    setVisitorId(getOrCreateVisitorId());
  }, []);

  return visitorId;
}
