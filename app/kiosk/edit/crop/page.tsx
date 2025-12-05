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
import { useCropStore } from "@/stores/crop-store";

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
  const pixelRatio = window.devicePixelRatio || 1;

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

  // ✅ Added Zustand store hook
  const { setCroppedImage } = useCropStore();

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
  const [error, setError] = useState<string>("");

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = () => {
    setError("");
  };

  const handleImageError = () => {
    setError("Failed to load image. Please check the URL.");
    console.error("[v0] Image failed to load from:", imageSrc);
  };

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      setError("Please select a crop area");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Draw cropped image onto canvas
      await canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotation
      );

      // Create a temporary canvas to scale down the image
      const scaleFactor = 0.5; // 50% of original size
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = previewCanvasRef.current.width * scaleFactor;
      tempCanvas.height = previewCanvasRef.current.height * scaleFactor;

      const ctx = tempCanvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context for temp canvas");

      ctx.drawImage(
        previewCanvasRef.current,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      // Convert to JPEG with lower quality (0.7)
      const croppedImage = tempCanvas.toDataURL("image/jpeg", 0.7);

      // ✅ Changed: Save to Zustand store instead of sessionStorage
      setCroppedImage(croppedImage);

      // Navigate to edit page
      setTimeout(() => {
        router.push(`/kiosk/edit?session=${sessionId}`);
      }, 100);
    } catch (e) {
      console.error("[v0] Error cropping image:", e);
      setError("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push(`/kiosk/edit?session=${sessionId}`);
  };

  if (!imageSrc) {
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden bg-pattern bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="text-foreground">No image provided for cropping</p>
        </div>
      </div>
    );
  }

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
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
            crossOrigin="anonymous"
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
              className="flex-1 h-12 text-md font-bold rounded-full border-[E4E4E7] text-primary hover:bg-gray-50  bg-white"
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
