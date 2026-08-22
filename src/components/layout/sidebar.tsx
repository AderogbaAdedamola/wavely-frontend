import Link from "next/link";

import { BrandMark } from "@/components/signal/brand-mark";
import { NavLinks } from "./nav-links";

/** Desktop sidebar — fixed rail with the brand, channels, and a build tag. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <BrandMark />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <NavLinks />
      </div>
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="eyebrow">Dispatch console</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">v2 · operator</p>
      </div>
    </aside>
  );
}
