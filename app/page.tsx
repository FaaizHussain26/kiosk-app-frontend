"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PostaFooter from "@/components/global/posta-footer";
import { useCreateSession } from "@/hooks/useCreateSession";

export default function Home() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const createSessionMutation = useCreateSession();

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const data = await createSessionMutation.mutateAsync();

      if (!data?.token) {
        console.error("No token returned from backend", data);
        alert(
          "Sorry, something went wrong starting your session. Please try again."
        );
        return;
      }

      router.push(`/kiosk/qr?session=${data.token}`);
    } catch (error) {
      console.error("Error creating session", error);
      alert(
        "Unable to connect to the kiosk service. Please call a staff member."
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Hero */}
        <h1 className="text-center mt-16 text-6xl font-bold text-primary leading-tight">
          Upload Your Favorite Photo,
          <span className="block m-0 p-0">Personalize & Print!</span>
        </h1>

        {/* Content Row */}
        <div className="flex items-center justify-center max-w-7xl w-full">
          {/* Left: Image (isolated container) */}
          <div className="h-[620px] flex items-center justify-center">
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
              width={450}
              height={450}
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
