import type React from "react";
import { KioskShell } from "@/components/global/kiosk-shell";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KioskShell>
      <div className="min-h-screen bg-white">{children}</div>
    </KioskShell>
  );
}
