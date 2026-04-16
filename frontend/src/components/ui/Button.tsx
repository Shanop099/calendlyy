import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>;

const styles = {
  primary: "rounded-2xl bg-[linear-gradient(135deg,#2d6df6,#5a93ff)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(45,109,246,0.2)]",
  secondary: "rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700",
  ghost: "rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100",
  danger: "rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 ring-1 ring-rose-100",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={`${styles[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
