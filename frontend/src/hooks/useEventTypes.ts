"use client";

import { useEffect, useState } from "react";
import { getEventTypes, type EventTypeDto } from "@/lib/api";

export function useEventTypes() {
  const [data, setData] = useState<EventTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getEventTypes()
      .then((value) => {
        if (!ignore) setData(value);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load event types");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading, error, setData };
}
