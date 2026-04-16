import type { PropsWithChildren } from "react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(70,90,128,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{description ?? "Dialog"}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500"
          >
            x
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
