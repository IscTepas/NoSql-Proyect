"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && <Navbar />}
      <main className="flex-1">{children}</main>
    </>
  );
}
