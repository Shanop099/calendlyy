"use client";

import { useEffect, useState } from "react";
import { getMeetings, type MeetingDto } from "@/lib/api";

export function useMeetings(filter?: "upcoming" | "past") {
  const [data, setData] = useState<MeetingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getMeetings(filter)
      .then((value) => {
        if (!ignore) setData(value);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load meetings");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [filter]);

  return { data, loading, error, setData };
}
