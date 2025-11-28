"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import { ProgressSteps } from "@/components/global/progress-steps"

export default function PrintPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session") || ""
  const [isPrinting, setIsPrinting] = useState(true)
  const [printProgress, setPrintProgress] = useState(0)

  useEffect(() => {
    // Simulate printing progress
    const interval = setInterval(() => {
      setPrintProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsPrinting(false)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  const handleNewOrder = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Steps - All Complete */}
      <ProgressSteps currentStep={0} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          {isPrinting ? (
            <>
              <Printer className="w-20 h-20 text-emerald-700 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Your Print is Ready!</h2>
              <p className="text-lg text-gray-600 mb-8">Your postcard is printing now. Please wait...</p>

              {/* Progress Bar */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-700 h-full transition-all duration-500"
                    style={{ width: `${Math.min(printProgress, 100)}%` }}
                  />
                </div>
                <p className="text-gray-600 mt-4 text-sm">{Math.round(Math.min(printProgress, 100))}% complete</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-20 h-20 text-emerald-700 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Print Complete!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Your personalized postcard has been printed successfully. Please collect your print from the tray.
              </p>

              {/* Success Box */}
              <div className="bg-emerald-50 rounded-lg shadow-lg p-8 mb-8 border border-emerald-200">
                <p className="text-emerald-800 font-medium">Thank you for using Posta! Enjoy your custom print! 📸</p>
              </div>

              {/* Action Button */}
              <Button onClick={handleNewOrder} size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                Start New Order
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white text-center py-4 text-sm">
        <p>© 2025 Posta. All rights reserved.</p>
      </footer>
    </div>
  )
}
