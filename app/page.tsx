"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image";

export default function Home() {
  const router = useRouter()
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9))

  const handleStart = () => {
    // Navigate to QR display page with session ID
    router.push(`/kiosk/qr?session=${sessionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-emerald-900 mb-6 text-balance">
            Upload Your Favorite Photo,
            <span className="block">Personalize & Print!</span>
          </h1>
          <p className="text-lg text-emerald-700 mb-12 text-balance">
            Create personalized photo prints in minutes. Just scan, upload, edit, and print!
          </p>
        </div>

        {/* Visual Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Left: Images */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-48 h-64">
              <div className="absolute left-0 top-8 transform -rotate-6">
                <Image
                  src="/images/post_card_1.png"
                  alt="Sample photo 1"
                  className="w-full h-full object-cover rounded-lg"
                  width={635}
                  height={635}
                />
              </div>
            </div>
          </div>

          {/* Right: Price & Button */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className=" rounded-full w-40 h-40 flex flex-col items-center justify-center ">
            <Image
              src="/images/start_button.png"
              alt="Sample photo 1"
              className="w-full h-full object-cover rounded-lg"
              width={635}
              onClick={handleStart}
              height={635}
            />
            </div>  
            <p className="text-2xl font-bold text-emerald-900 mt-8">Price: $3.50</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-emerald-700 mt-16 border-t border-emerald-300 pt-6">
          <p>© 2025 Posta. All rights reserved.</p>
          <p className="mt-2">Need help? Ask a staff member</p>
        </footer>
      </div>
    </div>
  )
}
