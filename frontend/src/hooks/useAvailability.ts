"use client";

import { useEffect, useState } from "react";
import { getAvailability, type AvailabilityResponse } from "@/lib/api";

export function useAvailability() {
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getAvailability()
      .then((value) => {
        if (!ignore) setData(value);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load availability");
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
