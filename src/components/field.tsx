import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string | undefined;
  wide?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
