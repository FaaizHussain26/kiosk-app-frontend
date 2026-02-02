"use client";

import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { useCropStore } from "@/stores/crop-store";
// import { StripeProvider } from "@/components/StripeProvider";
// import {
//   PaymentElement,
//   useElements,
//   useStripe,
// } from "@stripe/react-stripe-js";
// import {
//   confirmPaymentOnServer,
//   createPaymentIntent,
//   requestPrint,
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

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const printRef = useRef<HTMLDivElement>(null);

  // ✅ Get all values from Zustand store
  const { croppedImage, brightness, selectedFilter } = useCropStore();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // Use cropped image if available, otherwise fallback to original
  const imageUrl = useMemo(() => {
    if (croppedImage) {
      return croppedImage;
    }
    return sessionId
      ? `${API_BASE_URL}/session/${sessionId}/image`
      : "/photo-postcard-preview.jpg";
  }, [croppedImage, sessionId, API_BASE_URL]);

  // ✅ Apply the same filters as edit page
  const combinedFilter = `brightness(${brightness}%) ${filterStyles[selectedFilter]}`;

  const handleBack = useCallback(() => {
    router.push(`/kiosk/review?session=${sessionId}`);
  }, [router, sessionId]);

  const handlePrint = useCallback(() => {
    // Trigger browser print dialog
    window.print();
  }, []);

  return (
    <>
      <style jsx global>{`
        .print-area {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
            display: block !important;
          }
          .print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: white;
            z-index: 9999;
          }
          @page {
            margin: 0;
            size: auto;
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
            >
              Pay and Print
            </Button>

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

        {/* Hidden print area - only visible when printing */}
        <div ref={printRef} className="print-area">
          <div
            className="bg-card shadow-lg p-3 border border-border"
            style={{ width: "384px", height: "576px" }}
          >
            <div
              className="w-full overflow-hidden relative h-[505px] flex items-center justify-center"
              style={{ filter: combinedFilter }}
            >
              <Image
                src={imageUrl}
                alt="Photo to print"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
            <div className="flex justify-center mt-2">
              <Image
                src="/images/dbg-logo.png"
                alt="DBG Logo"
                width={55}
                height={55}
                unoptimized
                priority
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <PostaFooter />
      </div>
    </>
  );
}
