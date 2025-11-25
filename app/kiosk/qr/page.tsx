"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {QRCodeSVG} from 'qrcode.react';
import { ProgressSteps } from "@/components/global/progress-steps";

export default function QRPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session") || ""
  const [step, setStep] = useState(1)

  // Generate the mobile URL - in production, this would be your actual domain
  const mobileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/mobile/upload?session=${sessionId}`

  useEffect(() => {
    // Check if photo has been uploaded every 2 seconds
    const interval = setInterval(() => {
      // This would connect to your backend to check upload status
      // For now, it's a placeholder
      console.log("[v0] Checking for uploaded photo...")
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  const handleBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Steps */}
      <ProgressSteps index={step} />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-900">Scan to Upload Your Photo</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Use your {"phone's"} camera to scan the QR code below and upload your favorite photo.
          </p>

          {/* QR Code Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-lg border-4 border-gray-300">
                <QRCodeSVG
                  value={mobileUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  fgColor="#1f2937"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">⏱️ Code expires in 10 minutes</p>
            </div>

            {/* Instructions */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">How to Upload:</h3>
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
                  <div key={item.num} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-sm">
                        {item.num}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-8 pt-6 border-t border-gray-200">
                Having trouble? Ask a staff member for assistance
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-12">
            <Button
              onClick={handleBack}
              variant="outline"
              className="px-8 py-2 text-gray-700 border-gray-300 bg-transparent"
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm">
        <p>© 2025 Posta. All rights reserved.</p>
      </footer>
    </div>
  )
}
