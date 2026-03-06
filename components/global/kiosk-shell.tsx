"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useIdleActivity from "@/hooks/useIdleActivity";
import { useCropStore } from "@/stores/crop-store";

export function KioskShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const resetAll = useCropStore((s) => s.resetAll);

  const handleIdle = useCallback(() => {
    resetAll();
    sessionStorage.removeItem("lastSessionId");
    router.push("/");
  }, [resetAll, router]);

  const { showModal, resetIdleTimer } = useIdleActivity(handleIdle, {
    idleModalMs: 90_000,
    redirectMs: 30_000,
  });

  return (
    <>
      {children}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-[#18181B] mb-3">
              Are you still there?
            </h2>
            <p className="text-[#52525B] mb-6 text-sm">
              Your session will reset shortly due to inactivity.
            </p>
            <button
              onClick={resetIdleTimer}
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-full shadow-lg"
            >
              I&apos;m still here
            </button>
          </div>
        </div>
      )}
    </>
  );
}
