"use client";

import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const consitions = [
  "High quality print",
  "Premium postcard paper",
  "Ready in minutes",
];

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const imageUrl = sessionId
    ? `${API_BASE_URL}/session/${sessionId}/image`
    : "/photo-postcard-preview.jpg";

  // const imageUrl =
  //   "https://images.pexels.com/photos/32931764/pexels-photo-32931764.jpeg";

  const handleProceedToPayment = () => {
    router.push(`/kiosk/payment?session=${sessionId}`);
  };

  const handleBack = () => {
    router.push(`/kiosk/edit?session=${sessionId}`);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Progress Steps */}
      <ProgressSteps currentStep={4} />

      {/* Main Content */}
      <div className="w-full max-w-[1070px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          {/* Postcard Preview - Front and Back Side by Side */}
          <div className="flex gap-4 mx-auto">
            {/* Back - Message Side */}
            <div className="w-[340px]">
              <div
                className="bg-card shadow-lg border border-border overflow-hidden"
                style={{ width: "330px", height: "470px" }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/back-side-1.png"
                    alt="back-side"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Front - Photo Side */}
            <div className="w-[340px] ">
              <div
                className="bg-card shadow-lg p-4 border border-border"
                style={{ width: "330px", height: "470px" }}
              >
                <div className="w-full h-full overflow-hidden relative">
                  <Image
                    src={imageUrl}
                    alt="Photo preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="flex flex-col items-center">
            <div className="flex-1  max-w-[420px] w-full bg-card rounded-xl shadow-md border border-border p-6">
              <h2 className="text-xl font-bold mb-6 text-[#18181B]">
                Ready to Print?
              </h2>
              {/* Conditions List */}
              <div className="mb-6 space-y-4 ">
                {consitions.map((condition, index) => (
                  <li key={index} className="flex items-center  ">
                    <div className="shrink-0 mt-1 flex items-center justify-center">
                      <Image
                        src="/icons/check-icon.png"
                        alt="flip-icon"
                        width={15}
                        height={15}
                      />
                    </div>
                    <p className="ml-2 text-[#52525B] flex items-center justify-center">
                      {condition}
                    </p>
                  </li>
                ))}
              </div>

              <div className="mt-5 mb-5 border border-[#E4E4E7]"></div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full rounded-full h-12 text-md font-bold"
                  size="lg"
                  onClick={handleProceedToPayment}
                >
                  Confirm and Pay
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-[E4E4E7] text-[#52525B] hover:bg-gray-50 hover:text-gray-800 bg-white w-full rounded-full text-md font-bold"
                  size="lg"
                  onClick={handleBack}
                >
                  <Image
                    src="/icons/edit-icon.png"
                    alt="edit-icon"
                    width={15}
                    height={15}
                  />
                  Edit Photo
                </Button>
              </div>
            </div>
            <div className="mt-4 border rounded-2xl bg-gray-50">
              <p className="text-sm text-[#52525B] p-4 ">
                By confirming, you agree that the preview accurately represents
                your desired postcard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
