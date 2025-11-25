"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ProgressSteps } from "@/components/global/progress-steps"

export default function EditPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session") || ""

  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleNext = () => {
    router.push(`/kiosk/review?session=${sessionId}`)
  }

  const handleBack = () => {
    router.push(`/kiosk/qr?session=${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Steps */}
     <ProgressSteps index={3} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Edit Your Photo</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Preview */}
            <div className="md:col-span-2">
              <div
                className="bg-gray-200 rounded-lg overflow-hidden aspect-square flex items-center justify-center"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) rotate(${rotation}deg)`,
                }}
              >
                <img src="/photo-postcard-preview.jpg" alt="Photo preview" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Brightness: {brightness}%</label>
                <Slider
                  value={[brightness]}
                  onValueChange={(val) => setBrightness(val[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contrast: {contrast}%</label>
                <Slider
                  value={[contrast]}
                  onValueChange={(val) => setContrast(val[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Saturation: {saturation}%</label>
                <Slider
                  value={[saturation]}
                  onValueChange={(val) => setSaturation(val[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Rotation: {rotation}°</label>
                <Slider
                  value={[rotation]}
                  onValueChange={(val) => setRotation(val[0])}
                  min={-45}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-12">
            <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-emerald-700 hover:bg-emerald-800">
              Next: Review
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white text-center py-4 text-sm">
        <p>© 2025 Posta. All rights reserved.</p>
      </footer>
    </div>
  )
}
