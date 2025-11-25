"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"

type UploadState = "initial" | "rescan" | "success"

export default function MobileUploadPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session") || ""
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("initial")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    setIsLoading(true)

    // Simulate upload - in production, upload to backend
    setTimeout(() => {
      console.log("[v0] Photo uploaded for session:", sessionId)
      setState("rescan")
      setIsLoading(false)
    }, 1500)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRescanConfirm = () => {
    // In production, after rescanning verification, mark as complete
    setState("success")
  }

  const renderContent = () => {
    switch (state) {
      case "initial":
        return (
          <div className="w-full max-w-md mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Photo</h1>
            <p className="text-gray-600 mb-8">Select a photo from your library to create your postcard.</p>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> For best results, select a vertical photo.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragDrop}
              onDrop={handleDragDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="font-semibold text-gray-900 mb-1">Tap to Select Photo</p>
              <p className="text-sm text-gray-600">Choose from your photo library</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Requirements */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-3">Requirements:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Accepted formats: JPG, PNG, HEIC</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Best quality: High resolution photos</li>
              </ul>
            </div>
          </div>
        )

      case "rescan":
        return (
          <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
            <AlertCircle className="w-16 h-16 text-gray-700 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Please Rescan the QR Code</h1>
            <p className="text-gray-600 text-center mb-8">
              For your security, please rescan the kiosk QR code to finish uploading your photo.
            </p>
            <Button onClick={handleRescanConfirm} size="lg" className="bg-emerald-700 hover:bg-emerald-800">
              {"I've Rescanned the Code"}
            </Button>
          </div>
        )

      case "success":
        return (
          <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
            <CheckCircle2 className="w-20 h-20 text-emerald-700 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Successful!</h1>
            <p className="text-gray-600 text-center mb-8">
              Looking good! Your photo is ready for editing in the kiosk. You can close this tab.
            </p>
          </div>
        )
    }
  }

  return <div className="min-h-screen bg-white">{renderContent()}</div>
}
