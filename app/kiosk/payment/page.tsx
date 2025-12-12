"use client";

import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";

  const handleBack = useCallback(() => {
    router.push(`/kiosk/review?session=${sessionId}`);
  }, [router, sessionId]);
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Progress Steps */}
      <ProgressSteps currentStep={5} />

      <h2 className="text-center mt-4 text-5xl font-bold text-primary leading-tight">
        Tap or Insert to Pay
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

      <div className="w-full mt-70 max-w-[1070px] mx-auto px-4 py-8 flex flex-col justify-center items-center z-100">
        <div className="w-full max-w-[1070px] mx-auto flex flex-col justify-center items-center">
          <p className="text-center text-[#71717A] text-sm font-medium mb-4">
            Waiting for payment...
          </p>

          {/* Payment Card */}
          <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 w-[250px]  shadow-sm">
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

          {/* Back Button */}
          <Button
            variant="outline"
            className="h-12 mt-4 border-[E4E4E7] text-primary hover:bg-gray-50 bg-white w-[120px] rounded-full text-md font-bold"
            size="lg"
            onClick={handleBack}
          >
            Go Back
          </Button>
        </div>
      </div>
      <div className="relative ">
        <div className="absolute flex items-center gap-2 right-[40] top-[-65]">
          <p className="text-lg text-[#71717A] leading-tight">
            Secure Payment by
          </p>

          <Image
            src="/images/sripe-logo.png"
            alt="Stripe Logo"
            width={50}
            height={50}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
