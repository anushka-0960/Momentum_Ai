import { ReactNode } from "react";
import { AppShell } from "./AppShell";

export function RequireAuth({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
