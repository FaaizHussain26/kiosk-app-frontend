"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { ProgressSteps } from "@/components/global/progress-steps";
import PostaFooter from "@/components/global/posta-footer";
import Image from "next/image";

export default function QRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const [step, setStep] = useState(1);

  // Generate the mobile URL - in production, this would be your actual domain
  const mobileUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/mobile/upload?session=${sessionId}`;

  useEffect(() => {
    // Check if photo has been uploaded every 2 seconds
    const interval = setInterval(() => {
      // This would connect to your backend to check upload status
      // For now, it's a placeholder
      console.log("[v0] Checking for uploaded photo...");
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

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
    </div>
  );
}
