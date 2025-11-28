"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PostaFooter from "@/components/global/posta-footer";

export default function Home() {
  const router = useRouter();
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));

  const handleStart = () => {
    router.push(`/kiosk/qr?session=${sessionId}`);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Hero */}
        <h1 className="text-center mt-18 text-6xl font-bold text-primary leading-tight">
          Upload Your Favorite Photo,
          <span className="block m-0 p-0">Personalize & Print!</span>
        </h1>

        {/* Content Row */}
        <div className="flex items-center justify-center max-w-7xl w-full">
          {/* Left: Image (isolated container) */}
          <div className="h-[635px] flex items-center justify-center">
            <Image
              src="/images/postcard_pic.png"
              alt="Sample photos"
              width={480}
              height={480}
              className="object-contain mb-8"
            />
          </div>

          {/* Right: Start Button & Price */}
          <div className="flex flex-col items-center justify-center mb-25 ">
            <Image
              src="/images/start_button.png"
              alt="Start button"
              width={460}
              height={460}
              className="object-contain cursor-pointer"
              onClick={handleStart}
            />

            <p className="text-4xl font-bold text-primary">Price: $3.50</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
