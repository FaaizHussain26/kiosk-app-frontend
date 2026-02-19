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
  const kioskLocation = useKioskLocation();

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const printRef = useRef<HTMLDivElement>(null);

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

  const printImgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  // Navigate home and clean up session after a successful print
  const goHome = useCallback(() => {
    resetAll();
    sessionStorage.removeItem("lastSessionId");
    router.push("/");
  }, [resetAll, router]);

  // ─── Helper: render the final image (with filters) onto a canvas and return as Blob ───
  const renderFinalImageBlob = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = printImgRef.current;
      if (!img || !img.complete || img.naturalWidth === 0) {
        return reject(new Error("Image not ready"));
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No 2d context"));

      // Apply the same CSS filters via canvas context
      ctx.filter = combinedFilter || "none";
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create image blob"));
        },
        "image/jpeg",
        0.92,
      );
    });
  }, [combinedFilter]);

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

  // ─── Browser print (white border, location + date, baked filters) ───
  const handleBrowserPrint = useCallback(async () => {
    const img = printImgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;

    setIsPrinting(true);

    try {
      // Bake CSS filters directly into the pixel data
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.filter = combinedFilter || "none";
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

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
    object-fit: cover;
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
    <div>${kioskLocation}</div>
    <div>${dateStr}</div>
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
  }, [combinedFilter, goHome]);

  // ─── Exit fullscreen before printing (browsers block print dialog in fullscreen) ───
  const exitFullscreen = useCallback(async () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      try {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        // Small delay to let the browser finish exiting fullscreen
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        /* ignore — not critical */
      }
    }
  }, []);

  // ─── Main print handler: exit fullscreen first, then print ───
  const handlePrint = useCallback(async () => {
    await exitFullscreen();
    if (USE_SERVER_PRINT) {
      handleServerPrint();
    } else {
      handleBrowserPrint();
    }
  }, [exitFullscreen, handleServerPrint, handleBrowserPrint]);

  return (
    <>
      <style jsx global>{`
        /* Keep print area in DOM and rendered (invisible) so image loads */
        .print-area {
          position: fixed;
          left: 0;
          top: 0;
          width: 408px;
          height: 576px;
          opacity: 0;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
        }
        .print-area img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        @media print {
          /* Single page, no headers/footers, exact postcard size */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 4.25in !important;
            height: 6in !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible !important;
          }
          .print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 4.25in !important;
            height: 6in !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 99999 !important;
            background: white !important;
            opacity: 1 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-area img {
            width: 4.25in !important;
            height: 6in !important;
            max-width: 4.25in !important;
            max-height: 6in !important;
            object-fit: contain !important;
          }
          @page {
            margin: 0;
            size: 4.25in 6in;
          }
        }
      `}</style>

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
              className="h-12 mt-4 border-[E4E4E7] text-primary hover:bg-gray-50 bg-white w-[120px] rounded-full text-md font-bold hover:text-none"
              size="lg"
              onClick={handleBack}
            >
              Go Back
            </Button>
          </div>
        </div>

        {/* Print area: off-screen so image loads, only image at 4.25"x6" when printing */}
        <div ref={printRef} className="print-area">
          <div style={{ filter: combinedFilter, width: "100%", height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={printImgRef}
              src={imageUrl}
              alt="Postcard"
              crossOrigin="anonymous"
              onLoad={() => setImageLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Footer */}
        <PostaFooter />
      </div>
    </>
  );
}
