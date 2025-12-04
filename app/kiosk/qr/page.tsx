"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { ProgressSteps } from "@/components/global/progress-steps";
import PostaFooter from "@/components/global/posta-footer";
import Image from "next/image";
import useIdleActivity from "@/hooks/useIdleActivity";
import { useCropStore } from "@/stores/crop-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || API_BASE_URL.replace(/^http/, "ws");

export default function QRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const [step, setStep] = useState(1);

  // ✅ Get resetAll function from store
  const { resetAll } = useCropStore();

  const { showModal, resetIdleTimer } = useIdleActivity(() => {
    console.log("Idle timeout triggered");
    window.location.href = window.location.origin + "/";
  });

  const mobileUrl = useMemo(() => {
    if (typeof window === "undefined" || !sessionId) return "";
    return `${window.location.origin}/mobile/upload?session=${sessionId}`;
  }, [sessionId]);

  // ✅ Clear store when component mounts (new session starts)
  useEffect(() => {
    if (!sessionId) return;

    // Check if this is a new session
    const lastSessionId = sessionStorage.getItem("lastSessionId");

    if (lastSessionId !== sessionId) {
      // New session detected - clear everything from previous session
      console.log(
        "New session detected, clearing store for session:",
        sessionId
      );
      resetAll();
      sessionStorage.setItem("lastSessionId", sessionId);
    }
  }, [sessionId, resetAll]);

  // Listen for image upload via WebSocket and move to the edit step when ready
  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `${WS_BASE_URL}/ws?sessionId=${encodeURIComponent(
      sessionId
    )}`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
    } catch (error) {
      console.error("Failed to open WebSocket connection", error);
      return;
    }

    ws.onopen = () => {
      console.log("Connected to kiosk session WebSocket:", sessionId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          type?: string;
          sessionId?: string;
          imageUrl?: string;
        };

        if (data.type === "image_ready" && data.sessionId === sessionId) {
          console.log("Image ready for session:", sessionId, data.imageUrl);
          setStep(3);
          router.push(`/kiosk/edit?session=${sessionId}`);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error", event);
    };

    ws.onclose = () => {
      console.log("WebSocket closed for session:", sessionId);
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [router, sessionId]);

  const handleStayHere = () => {
    resetIdleTimer();
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Progress Steps */}
      <ProgressSteps currentStep={step} />

      <h2 className="text-center mt-5 text-5xl font-bold text-primary leading-tight">
        Scan to Upload Your Photo
      </h2>
      <p className="text-center text-[#52525B] mt-3 text-lg">
        Use your {"phone's"} camera to scan the QR code below and upload your
        favorite photo.
      </p>

      <div className="flex items-center justify-center p-6">
        <div className="max-w-[750px] w-full bg-white rounded-2xl border md:p-12 shadow-[2px_2px_7px_rgba(0,0,0,0.1)]">
          {/* QR Code Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="flex flex-col items-center ">
              <div className="bg-white p-3 rounded-lg border-4 border-primary">
                <QRCodeSVG
                  value={mobileUrl}
                  size={270}
                  level="H"
                  includeMargin={true}
                  fgColor="#18181B"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-sm text-[#52525B] mt-4 flex items-center justify-center">
                <Image
                  src="/icons/time-icon.png"
                  alt="time-icon"
                  width={18}
                  height={18}
                  className="inline-block mr-1"
                />
                Code expires in 10 minutes
              </p>
            </div>

            {/* Instructions */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold mb-6 text-[#18181B]">
                How to Upload:
              </h3>
              <div className="space-y-6">
                {[
                  {
                    num: 1,
                    title: "Open your camera app",
                    desc: "Point your phone's camera at the QR code",
                  },
                  {
                    num: 2,
                    title: "Tap the notification",
                    desc: "Your phone will show a link to open",
                  },
                  {
                    num: 3,
                    title: "Select your photo",
                    desc: "Choose from your photo library",
                  },
                ].map((item) => (
                  <div key={item.num} className="flex gap-2">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold font-semibold">
                        {item.num}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[#18181B]">
                        {item.title}
                      </p>
                      <p className="text-sm text-[#52525B]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#52525B] mt-5 pt-5 border-t border-gray-200">
                Having trouble? Ask a staff member for assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mb-15">
        <Button
          onClick={handleBack}
          className="px-14 py-4 text-[#18181B] border-gray-300 bg-transparent border hover:bg-gray-100 rounded-sm"
        >
          Back
        </Button>
      </div>

      {/* Footer */}
      <PostaFooter />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-[#18181B] mb-4 text-center">
              Are you still there?
            </h3>
            <p className="text-[#52525B] mb-6 text-center">
              <p>
                You&apos;ve been idle for a while. The app will return to the
                home screen shortly.
              </p>
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleStayHere}
                className="px-8 py-3 bg-primary text-white hover:bg-primary/90 rounded-sm"
              >
                Stay Here
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
