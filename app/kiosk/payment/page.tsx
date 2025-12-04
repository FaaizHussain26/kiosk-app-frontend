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

      <h2 className="text-center mt-5 text-5xl font-bold text-primary leading-tight">
        Tap or Insert to Pay
      </h2>
      <div className="relative ">
        <div className="absolute w-150 h-150 left-[380] top-[-20]">
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

      <div className="w-full mt-80 max-w-[1070px] mx-auto px-4 py-8 flex flex-col justify-center items-center z-100">
        <p className="text-center mt-5  text-[#52525B] leading-tight">
          Waiting for payment...
        </p>

        <h2 className="text-center mt-2 text-4xl font-bold text-primary leading-tight">
          $3.50
        </h2>

        <Button
          variant="outline"
          className="h-12 mt-5 border-[#E4E4E7] text-primary hover:bg-gray-50 bg-white w-[120px] rounded-full text-base font-bold"
          size="lg"
          onClick={handleBack}
        >
          Go Back
        </Button>
      </div>
      <div className="flex justify-end items-center gap-2 mr-8 ">
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

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
