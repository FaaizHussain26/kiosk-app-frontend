"use client";

import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRouter, useSearchParams } from "next/navigation";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { ProgressSteps } from "@/components/global/progress-steps";
import PostaFooter from "@/components/global/posta-footer";

const TO_RADIANS = Math.PI / 180;

async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
}

const CropImage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageSrc = decodeURIComponent(searchParams.get("image") || "");
  const sessionId = searchParams.get("session") || "";

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 75,
    height: 100,
    x: 12.5,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    setIsProcessing(true);
    try {
      await canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotation
      );

      const croppedImage = previewCanvasRef.current.toDataURL(
        "image/jpeg",
        0.95
      );
      sessionStorage.setItem("croppedImage", croppedImage);
      router.push(`/kiosk/edit?session=${sessionId}`);
    } catch (e) {
      console.error("Error cropping image:", e);
      alert("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/kiosk/edit?session=${sessionId}`);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background">
      {/* Header */}
      <ProgressSteps currentStep={3} />

      <h2 className="text-center mt-5 text-5xl font-bold text-primary leading-tight">
        Crop Photo
      </h2>

      {/* Crop Area */}
      <div className="w-[280px] mx-auto mt-6">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={3 / 4}
          className="max-w-full"
        >
          <img
            ref={imgRef}
            alt="Crop preview"
            src={imageSrc}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        </ReactCrop>
      </div>

      {/* Hidden canvas for processing */}
      <canvas
        ref={previewCanvasRef}
        style={{
          display: "none",
        }}
      />

      {/* Controls Footer */}

      <div className="container mx-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 text-md font-bold rounded-full border-[E4E4E7] text-[#52525B] hover:bg-gray-50 hover:text-gray-800 bg-white"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 text-md font-bold rounded-full"
              onClick={handleCrop}
              disabled={isProcessing || !completedCrop}
            >
              {isProcessing ? "Processing..." : "Crop"}
            </Button>
          </div>
        </div>
      </div>
      {/* Footer */}
      <PostaFooter />
    </div>
  );
};

export default CropImage;
