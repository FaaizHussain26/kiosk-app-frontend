"use client";

import type React from "react";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useUploadSessionImage } from "@/hooks/useUploadSessionImage";
import PostaMobileFooter from "@/components/mobile/posta-mobile-footer";
import Image from "next/image";

type UploadState = "initial" | "rescan" | "success";

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("initial");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const uploadMutation = useUploadSessionImage();

  const handleFileSelect = async (file: File) => {
    if (!sessionId) {
      alert(
        "This upload link is invalid or has expired. Please rescan the QR code on the kiosk."
      );
      router.push("/");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const data = await uploadMutation.mutateAsync({ sessionId, file });
      console.log("Photo uploaded for session:", sessionId, data);

      // After successful upload, immediately show success to the user
      setState("success");
    } catch (error) {
      console.error("Error uploading image", error);
      alert(
        "We couldn't upload your photo. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRescanConfirm = () => {
    setState("success");
  };

  const renderContent = () => {
    switch (state) {
      case "initial":
        return (
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto px-6 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
            <h1 className="text-4xl font-bold text-primary mb-2 mt-2">
              Upload Your Photo
            </h1>
            <p className="text-[#18181B] ">
              Select a photo from your library to create your postcard.
            </p>

            <div className="mt-4 mb-8 flex items-center">
              <p className="text-[#18181B] w-full max-w-[300px]">
                Note: For best results, select a vertical photo.
              </p>
              <div className="w-[60px] h-[60px] ml-5 mr-8">
                <Image
                  src="/icons/mobile-icon.png"
                  alt="Mobile Icon"
                  className="w-full h-full object-contain"
                  width={75}
                  height={75}
                />
              </div>
            </div>

            {/* Upload Area */}
            <div className="flex-1 max-w-sm w-full bg-card rounded-xl shadow-md border border-border p-6">
              <div
                onClick={() => {
                  if (!isLoading) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={handleDragDrop}
                onDrop={handleDragDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isLoading
                    ? "border-gray-200 bg-gray-50 cursor-default opacity-70"
                    : "border-gray-300 cursor-pointer hover:border-gray-400"
                }`}
                aria-busy={isLoading}
              >
                <Image
                  src="/icons/upload-icon.png"
                  alt="filter-icon"
                  width={45}
                  height={50}
                  className="w-14 h-14 text-gray-400 mx-auto mb-2"
                />

                <p className="text-[#18181B] ">
                  {isLoading
                    ? "Uploading your photo..."
                    : "Tap to Select Photo"}
                </p>
                <p className="text-sm text-[#18181B]">
                  {isLoading
                    ? "Please wait while we upload your image. Don't close this tab."
                    : "Choose from your photo library"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="mt-6 mb-6 border border-[#E4E4E7]"></div>

              {/* Requirements */}
              <div>
                <p className="font-semibold text-[#18181B] mb-3">
                  Requirements:
                </p>
                <ul className="text-sm text-[#52525B] space-y-2">
                  <li>
                    <span className="mr-1 font-black">•</span> Accepted formats:
                    JPG, PNG, HEIC
                  </li>
                  <li>
                    <span className="mr-1 font-black">•</span> Maximum file
                    size: 10MB
                  </li>
                  <li>
                    <span className="mr-1 font-black">•</span> Best quality:
                    High resolution photos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "rescan":
        return (
          <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-primary mb-2 text-center">
              Please Rescan the QR Code
            </h1>
            <p className="text-[#18181B] text-center mb-8">
              For your security, please rescan the kiosk QR code to finish
              uploading your photo.
            </p>
            <Button
              onClick={handleRescanConfirm}
              size="lg"
              className="bg-primary hover:bg-primary/80"
              disabled={isLoading}
            >
              {"I've Rescanned the Code"}
            </Button>
          </div>
        );

      case "success":
        return (
          <div className="w-full max-w-md mx-auto px-4 py-8 min-h-screen">
            <div className="mt-10 flex flex-col items-center">
              <Image
                src="/icons/upload-success-icon.png"
                alt="success-icon"
                width={70}
                height={70}
                className="w-26 h-26 t mx-auto mb-6"
              />

              <h1 className="text-4xl font-bold text-primary mb-2 mt-2">
                Upload Successful!
              </h1>
              <p className="text-[#18181B] text-center ">
                Looking good! Your photo is ready for editing in the kiosk. You
                can close this tab.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-pattern bg-background">
      {renderContent()}
      <div>
        <PostaMobileFooter />
      </div>
    </div>
  );
}
