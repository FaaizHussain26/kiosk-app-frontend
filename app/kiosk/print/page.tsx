"use client";

import PostaFooter from "@/components/global/posta-footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function PrintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session") || "";

  const imageUrl = useMemo(() => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    return sessionId
      ? `${apiBaseUrl}/session/${sessionId}/image`
      : "/photo-postcard-preview.jpg";
  }, [sessionId]);

  // const imageUrl =
  //   "https://images.pexels.com/photos/32931764/pexels-photo-32931764.jpeg";

  const handleNewOrder = () => {
    router.push("/");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Main Content */}
      <div className="mt-18">
        <h2 className="text-center mt-5 text-5xl font-bold text-primary leading-tight">
          Your Memory is Taking Shape....
        </h2>
        <p className="text-center text-[#71717A] text-xl mt-1">
          Your postcard is printing now - pick it up at the front desk in just a
          moment!
        </p>
      </div>

      <div className="relative z-10 ">
        <div className="absolute w-180 h-150 left-[220] top-[-20]">
          <Image
            src="/images/print-bg.png"
            alt="back-side-photo"
            width={460}
            height={460}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      <div className="w-[325px] mx-auto mt-6 flex flex-col item-center justify-center z-100">
        <div className="flex items-center justify-center ">
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
        <Button
          variant="outline"
          className="h-12 mt-5 border-[E4E4E7] text-primary hover:bg-gray-50 bg-white w-full
           rounded-full text-md font-bold flex item-center justify-center"
          size="lg"
          onClick={handleNewOrder}
        >
          Print Another Postcard
        </Button>
      </div>

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
