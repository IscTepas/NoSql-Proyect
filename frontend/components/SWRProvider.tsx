"use client";

import { SWRConfig } from "swr";
import { swrFetcher } from "@/lib/api";

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        dedupingInterval: 60000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
