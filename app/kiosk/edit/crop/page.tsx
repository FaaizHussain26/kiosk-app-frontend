"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import PostaFooter from "@/components/global/posta-footer";
import { ProgressSteps } from "@/components/global/progress-steps";
import { useCropStore } from "@/stores/crop-store";
import Image from "next/image";

// Cap canvas output to avoid exceeding browser limits on iPad/HiDPI displays.
// iPad Safari caps at ~4096; keeping lower also reduces sessionStorage pressure
// (base64 JPEG at 2048×2048 ≈ 300-500 KB, well within the 5 MB limit).
const MAX_CANVAS_DIM = 2048;

async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Validate image has real dimensions (not still loading or broken)
  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    throw new Error("Image has zero dimensions — it may not be fully loaded");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Calculate crop area at the image's natural resolution.
  // NOTE: Do NOT multiply by devicePixelRatio here — we are generating a data URL
  // for storage, not rendering to screen. pixelRatio can make canvases exceed
  // browser limits (e.g. 8000×6000 × 3 = 24000px), causing toDataURL() to
  // silently return "data:," which renders as a black image.
  let outW = Math.floor(crop.width * scaleX);
  let outH = Math.floor(crop.height * scaleY);

  // Cap dimensions to prevent exceeding browser canvas limits
  if (outW > MAX_CANVAS_DIM || outH > MAX_CANVAS_DIM) {
    const ratio = Math.min(MAX_CANVAS_DIM / outW, MAX_CANVAS_DIM / outH);
    outW = Math.floor(outW * ratio);
    outH = Math.floor(outH * ratio);
  }

  canvas.width = outW;
  canvas.height = outH;

  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropW = crop.width * scaleX;
  const cropH = crop.height * scaleY;

  if (rotate === 0 && scale === 1) {
    // Fast path: simple crop via drawImage source/dest rects
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
  } else {
    // General path: supports rotation and zoom
    const outputScale = outW / cropW; // accounts for any dimension capping
    ctx.scale(outputScale, outputScale);

    const rotateRads = rotate * (Math.PI / 180);
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
      image.naturalHeight,
    );

    ctx.restore();
  }
}

const CropImage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageSrc = decodeURIComponent(searchParams.get("image") || "");
  const sessionId = searchParams.get("session") || "";

  const { setCroppedImage } = useCropStore();

  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // When the image loads, compute an initial completedCrop in pixels so the
  // "Crop" button is immediately enabled (user doesn't have to drag first).
  const handleImageLoad = useCallback(() => {
    setError("");
    const img = imgRef.current;
    if (img && img.width > 0 && img.height > 0) {
      setCompletedCrop({
        unit: "px",
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    }
  }, []);

  const handleImageError = () => {
    setError("Failed to load image. Please check the URL.");
    console.error("[crop] Image failed to load from:", imageSrc);
  };

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      setError("Please select a crop area");
      return;
    }

    // Guard against 0-dimension images (still loading, broken, or layout not ready)
    if (imgRef.current.naturalWidth === 0 || imgRef.current.naturalHeight === 0) {
      setError("Image not fully loaded. Please wait and try again.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      await canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotation,
      );

      // Convert canvas directly to data URL — no intermediate temp canvas needed.
      // The canvasPreview function already caps dimensions to a safe size.
      const croppedImage = previewCanvasRef.current.toDataURL("image/jpeg", 0.75);

      // Validate the output isn't an empty/black canvas
      if (!croppedImage || croppedImage === "data:," || croppedImage.length < 100) {
        throw new Error("Canvas produced an empty image — likely exceeded browser limits");
      }

      setCroppedImage(croppedImage);

      setTimeout(() => {
        router.push(`/kiosk/edit?session=${sessionId}`);
      }, 100);
    } catch (e) {
      console.error("[crop] Error cropping image:", e);
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
    <div
      className="fixed inset-0 w-full flex flex-col bg-pattern bg-background"
      style={{ overflow: "hidden", touchAction: "none" }}
    >
      {/* Header */}
      <div className="shrink-0">
        <ProgressSteps currentStep={3} />
      </div>

      <h2 className="text-center mt-1 text-3xl font-bold text-primary leading-tight shrink-0">
        Crop Photo
      </h2>

      {/* Crop Area — fixed height so buttons are always visible */}
      <div
        className="flex justify-center items-center px-4 overflow-hidden"
        style={{ height: "55%" }}
        data-allow-touch
      >
        <div className="w-[280px] h-full flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={3 / 4}
            className="max-w-full max-h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                touchAction: "none",
              }}
            />
          </ReactCrop>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={previewCanvasRef} style={{ display: "none" }} />

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-500 text-sm shrink-0">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="shrink-0 px-6 py-3">
        <div className="max-w-md mx-auto flex gap-4">
          <Button
            variant="outline"
            className="flex-1 h-12 text-md font-bold rounded-full border-[E4E4E7] text-primary hover:bg-gray-50 bg-white hover:text-none"
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

      {/* Footer */}
      <div className="shrink-0">
        <PostaFooter />
      </div>
    </div>
  );
};

export default CropImage;
