import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{children}</span>;
}
