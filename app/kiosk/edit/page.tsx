"use client";

import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useCropStore } from "@/stores/crop-store";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type FilterType = "original" | "warm" | "cool" | "pastel" | "mono" | "sepia";

const filters: { label: string; value: FilterType }[] = [
  { label: "Original", value: "original" },
  { label: "Warm", value: "warm" },
  { label: "Cool", value: "cool" },
  { label: "Pastel", value: "pastel" },
  { label: "Mono", value: "mono" },
  { label: "Sepia", value: "sepia" },
];

const filterStyles: Record<FilterType, string> = {
  original: "",
  warm: "sepia(20%) saturate(140%) hue-rotate(-10deg)",
  cool: "saturate(90%) hue-rotate(15deg) brightness(105%)",
  pastel: "saturate(70%) brightness(110%) contrast(90%)",
  mono: "grayscale(100%)",
  sepia: "sepia(80%)",
};

export default function EditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";

  // ✅ Get all values from Zustand store
  const {
    croppedImage,
    brightness,
    selectedFilter,
    setBrightness,
    setSelectedFilter,
    resetFilters,
    resetAll,
  } = useCropStore();

  const [isFlipped, setIsFlipped] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const imageUrl = sessionId
    ? `${API_BASE_URL}/session/${sessionId}/image`
    : "https://images.pexels.com/photos/34934422/pexels-photo-34934422.jpeg";

  const handleReset = () => {
    resetFilters();
  };

  const combinedFilter = `brightness(${brightness}%) ${filterStyles[selectedFilter]}`;

  const handleNext = () => {
    router.push(`/kiosk/review?session=${sessionId}`);
  };

  const handleBack = () => {
    resetAll();
    sessionStorage.removeItem("lastSessionId");

    router.push("/");
  };

  const handleCrop = () => {
    const cropUrl = `/kiosk/edit/crop?image=${encodeURIComponent(
      imageUrl
    )}&session=${sessionId}`;
    router.push(cropUrl);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .postcard-lines {
          background-image: repeating-linear-gradient(
            transparent,
            transparent 19px,
            #e5e7eb 19px,
            #e5e7eb 20px
          );
        }
      `}</style>

      {/* Progress Steps */}
      <ProgressSteps currentStep={3} />

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto px-3 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Postcard Preview */}
          <div className="w-[380px] mx-auto">
            <div
              className="flip-card relative w-full"
              style={{ height: "570px" }}
            >
              <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
                {/* Front - Photo Side */}
                <div
                  className="flip-card-front bg-card shadow-lg p-3 border border-border"
                  style={{ width: "384px", height: "576px" }}
                >
                  <div
                    className="w-full overflow-hidden relative h-[505px] flex items-center justify-center "
                    style={{ filter: combinedFilter }}
                  >
                    <Image
                      src={croppedImage || imageUrl}
                      alt="Photo preview"
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

                {/* Back - Message Side */}
                <div
                  className="flip-card-back bg-card shadow-lg border border-border"
                  style={{ width: "384px", height: "576px" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/back-side-1.png"
                      alt="back-side"
                      width={384}
                      height={576}
                      className="w-full h-full object-fill"
                      priority
                    />
                  </div>
                </div>
              </div>
              {/* Flip Button - Positioned absolutely */}
              <div className="absolute -bottom-7 right-0 transform translate-x-1/2">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="mx-auto mt-4 flex flex-col items-center gap-1 text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-border bg-card flex flex-col items-center justify-center gap-0.5 hover:bg-muted transition-colors">
                    <Image
                      src="/icons/flip-icon.png"
                      alt="flip-icon"
                      width={25}
                      height={25}
                    />
                    <span className="text-[10px] text-[#52525B] font-medium leading-none mt-1">
                      {isFlipped ? "View Front" : "View Back"}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="flex-1 max-w-sm w-full bg-card rounded-xl shadow-md border border-border p-6">
            <h2 className="text-xl font-bold mb-6 text-[#18181B]">
              Edit Your Photo
            </h2>

            {/* Filters Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/icons/filter-icon.png"
                  alt="filter-icon"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-foreground">
                  Filters
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      selectedFilter === filter.value ? "default" : "outline"
                    }
                    className={
                      selectedFilter === filter.value
                        ? "h-12"
                        : "h-12 border-[E4E4E7] text-[#52525B] hover:bg-gray-50 bg-white hover:text-gray-800"
                    }
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Brightness Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/icons/brightness-icon.png"
                  alt="filter-icon"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-foreground">
                  Brightness: {brightness}%
                </span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={(val) => setBrightness(val[0])}
                min={50}
                max={150}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-2">
              <span className="text-sm font-medium text-foreground mb-3 block">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 border-[E4E4E7] text-[#52525B] hover:bg-gray-50 hover:text-gray-800 bg-white flex items-center gap-2"
                  onClick={handleCrop}
                >
                  <Image
                    src="/icons/crop-icon.png"
                    alt="crop-icon"
                    width={16}
                    height={16}
                  />
                  Crop Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-12 border-[E4E4E7] text-[#52525B] hover:bg-gray-50 hover:text-gray-800 bg-white flex items-center gap-2"
                >
                  <Image
                    src="/icons/reset-icon.png"
                    alt="reset-icon"
                    width={16}
                    height={16}
                  />
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-6 mb-6 border border-[#E4E4E7]"></div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full rounded-full h-12 text-md font-bold"
                size="lg"
                onClick={handleNext}
              >
                Save and Continue
              </Button>
              <Button
                variant="outline"
                className="h-12 hover:text-none border-[#E4E4E7] text-primary hover:bg-gray-50 bg-white w-full rounded-full text-md font-bold"
                size="lg"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PostaFooter />
    </div>
  );
}
