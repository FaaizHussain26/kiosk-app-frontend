"use client";

import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { useCropStore } from "@/stores/crop-store";
import { requestPrintWithImage } from "@/services/session";
import { useKioskLocation } from "@/hooks/useKioskLocation";
import {
  setKioskPrintMode,
  exitFullscreen,
} from "@/components/full-screen-manager";
import { drawFilteredImage } from "@/lib/canvas-filters";
// import { StripeProvider } from "@/components/StripeProvider";
// import {
//   PaymentElement,
//   useElements,
//   useStripe,
// } from "@stripe/react-stripe-js";
// import {
//   confirmPaymentOnServer,
//   createPaymentIntent,
// } from "@/services/session";

type FilterType = "original" | "warm" | "cool" | "pastel" | "mono" | "sepia";

const filterStyles: Record<FilterType, string> = {
  original: "",
  warm: "sepia(20%) saturate(140%) hue-rotate(-10deg)",
  cool: "saturate(90%) hue-rotate(15deg) brightness(105%)",
  pastel: "saturate(70%) brightness(110%) contrast(90%)",
  mono: "grayscale(100%)",
  sepia: "sepia(80%)",
};

// Whether to use server-side CUPS printing (bypasses browser dialog)
const USE_SERVER_PRINT =
  process.env.NEXT_PUBLIC_USE_SERVER_PRINT === "true";

export default function PaymentPage() {
  // Auto-detected location via GPS + reverse geocoding (cached per session)

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";

  const { croppedImage, brightness, selectedFilter, resetAll } = useCropStore();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const imageUrl = useMemo(() => {
    if (croppedImage) {
      return croppedImage;
    }
    return sessionId
      ? `${API_BASE_URL}/session/${sessionId}/image`
      : "/photo-postcard-preview.jpg";
  }, [croppedImage, sessionId, API_BASE_URL]);

  const combinedFilter = `brightness(${brightness}%) ${filterStyles[selectedFilter]}`;

  const handleBack = useCallback(() => {
    router.push(`/kiosk/review?session=${sessionId}`);
  }, [router, sessionId]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  // Navigate home, clean up session, and re-enable fullscreen
  const goHome = useCallback(() => {
    setKioskPrintMode(false);
    resetAll();
    sessionStorage.removeItem("lastSessionId");
    router.push("/");
  }, [resetAll, router]);

  const needsFilter = selectedFilter !== "original" || brightness !== 100;

  // ─── Load the image at FULL resolution (not limited by display size) ───
  // Using fetch + createImageBitmap guarantees the full pixel data is decoded,
  // unlike a hidden <img> which Safari can lazy-decode at display size.
  const loadFullResImage = useCallback(async (): Promise<HTMLImageElement> => {
    if (imageUrl.startsWith("data:")) {
      // Data URL (cropped image) — load into an Image directly
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load cropped image"));
        img.src = imageUrl;
      });
    }

    // Cross-origin API image — fetch as blob to avoid CORS canvas tainting
    // and ensure full-resolution decode
    const res = await fetch(imageUrl, { mode: "cors" });
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to decode image"));
      };
      img.src = objectUrl;
    });
  }, [imageUrl]);

  // ─── Helper: render the final image (with filters baked into pixels) as Blob ───
  const renderFinalImageBlob = useCallback(async (): Promise<Blob> => {
    const img = await loadFullResImage();

    const canvas = document.createElement("canvas");

    if (needsFilter) {
      drawFilteredImage(canvas, img, selectedFilter, brightness);
    } else {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2d context");
      ctx.drawImage(img, 0, 0);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create image blob"));
        },
        "image/jpeg",
        0.98,
      );
    });
  }, [loadFullResImage, selectedFilter, brightness, needsFilter]);

  // ─── Server-side CUPS printing (no dialog, auto-configured settings) ───
  const handleServerPrint = useCallback(async () => {
    setIsPrinting(true);
    setPrintError("");
    try {
      const blob = await renderFinalImageBlob();
      await requestPrintWithImage({ sessionId, imageBlob: blob });
      // Print job submitted — return to home screen
      setTimeout(goHome, 1500);
    } catch (err) {
      console.error("Server print failed:", err);
      setPrintError("Print failed. Please try again.");
      setIsPrinting(false);
    }
  }, [renderFinalImageBlob, sessionId, goHome]);

  // ─── Browser print (white border, location + date, pixel-baked filters) ───
  const handleBrowserPrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const img = await loadFullResImage();

      let dataUrl: string;

      if (needsFilter) {
        const canvas = document.createElement("canvas");
        drawFilteredImage(canvas, img, selectedFilter, brightness);
        dataUrl = canvas.toDataURL("image/jpeg", 0.98);
      } else if (imageUrl.startsWith("data:")) {
        dataUrl = imageUrl;
      } else {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        dataUrl = canvas.toDataURL("image/jpeg", 0.98);
      }

      // Long-form date, e.g. "February 18, 2026"
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const printDoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title> </title>
<style>
  * { margin: 0; padding: 0; border: none; outline: none; box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .postcard {
    width: 100%;
    height: 100%;
    padding: 50px;
    padding-top: 70px;
    display: flex;
    flex-direction: column;
  }
  .image-area {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .image-area img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .info {
    flex-shrink: 0;
    text-align: right;
    padding-top: 25px;
    font-size: 8px;
    font-family: Arial, Helvetica, sans-serif;
    color: #000;
    line-height: 1.4;
  }
  @page {
    margin: 0;
    size: 4.25in 6in;
  }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; }
  }
</style>
</head>
<body>
<div class="postcard">
  <div class="image-area"><img src="${dataUrl}" alt="Postcard" /></div>
  <div class="info">
    <div></div>
    <div></div>
  </div>
</div>
</body>
</html>`;

      const printWin = window.open("", "_blank");
      if (!printWin) {
        window.print();
        return;
      }
      printWin.document.write(printDoc);
      printWin.document.close();

      const doPrint = () => {
        let navigated = false;
        const navigateHome = () => {
          if (navigated) return;
          navigated = true;
          try { printWin.close(); } catch { /* ok */ }
          goHome();
        };

        printWin.onafterprint = navigateHome;

        const onFocus = () => {
          window.removeEventListener("focus", onFocus);
          setTimeout(navigateHome, 500);
        };
        window.addEventListener("focus", onFocus);

        setTimeout(navigateHome, 60_000);

        printWin.focus();
        printWin.print();
      };

      const printImg = printWin.document.querySelector("img");
      if (printImg && (printImg as HTMLImageElement).complete) {
        doPrint();
      } else if (printImg) {
        (printImg as HTMLImageElement).onload = doPrint;
      } else {
        printWin.onload = doPrint;
      }
    } finally {
      setIsPrinting(false);
    }
  }, [loadFullResImage, imageUrl, selectedFilter, brightness, needsFilter, goHome]);

  // ─── Main print handler: pause fullscreen, exit, print ───
  const handlePrint = useCallback(async () => {
    // Tell the FullscreenManager to stop re-entering fullscreen
    setKioskPrintMode(true);
    await exitFullscreen();
    // Small delay to let the browser settle after exiting fullscreen
    await new Promise((r) => setTimeout(r, 400));

    if (USE_SERVER_PRINT) {
      handleServerPrint();
    } else {
      handleBrowserPrint();
    }
  }, [handleServerPrint, handleBrowserPrint]);

  return (
    <>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
        {/* Progress Steps */}
        <ProgressSteps currentStep={5} />

        <h2 className="text-center mt-4 text-5xl font-bold text-primary leading-tight">
          Ready to Print
        </h2>
        <div className="relative ">
          <div className="absolute w-140 h-140 left-[400] top-[-50]">
            <Image
              src="/images/card-hand.png"
              alt="Card Hand"
              width={360}
              height={360}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="w-full mt-70 max-w-[1070px] mx-auto px-4 py-8 flex flex-col justify-center items-center z-20">
          <div className="w-full max-w-[1070px] mx-auto flex flex-col justify-center items-center">
            <p className="text-center text-[#71717A] text-sm font-medium mb-4">
              Click the button below to print your postcard.
            </p>

            {/* Payment Card */}
            <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 w-[250px] shadow-sm mb-4">
              {/* Breakdown Items */}
              <div className="space-y-1 mb-0">
                <div className="flex justify-between items-center">
                  <span className="text-[#52525B] text-sm">Postcard</span>
                  <span className="text-[#18181B] text-sm font-semibold">
                    $3.50
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52525B] text-sm">Tax</span>
                  <span className="text-[#18181B] text-sm font-semibold">
                    $0.43
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E4E4E7] my-2"></div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-primary text-lg font-bold">Total</span>
                <span className="text-primary text-3xl font-bold">$3.93</span>
              </div>
            </div>
          <div className="flex flex-row items-center justify-center gap-4">

            {/* Print Button */}
            <Button
              className="w-full rounded-full h-12 text-md font-bold max-w-[250px]"
              size="lg"
              onClick={handlePrint}
              disabled={!imageLoaded || isPrinting}
            >
              {isPrinting
                ? "Printing…"
                : imageLoaded
                  ? "Pay and Print"
                  : "Loading image…"}
            </Button>

            {printError && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {printError}
              </p>
            )}

            {/* Back Button */}
            <Button
              variant="outline"
              className="h-12 border-[E4E4E7] text-primary hover:bg-gray-50 bg-white w-[120px] rounded-full text-md font-bold hover:text-none"
              size="lg"
              onClick={handleBack}
            >
              Go Back
            </Button>
          </div>
          </div>
        </div>

        {/* Hidden preload — just verifies the image is reachable.
            Actual full-res loading happens in loadFullResImage() at print time. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          crossOrigin="anonymous"
          onLoad={() => setImageLoaded(true)}
          style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
        />

        {/* Footer */}
        <PostaFooter />
      </div>
    </>
  );
}
