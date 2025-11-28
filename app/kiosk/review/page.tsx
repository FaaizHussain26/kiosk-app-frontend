"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ProgressSteps } from "@/components/global/progress-steps";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";

  const handleProceedToPayment = () => {
    router.push(`/kiosk/payment?session=${sessionId}`);
  };

  const handleBack = () => {
    router.push(`/kiosk/edit?session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Steps */}
      <ProgressSteps currentStep={4} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Review Your Order
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">Preview</p>
              <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square">
                <img
                  src="/photo-postcard-preview.jpg"
                  alt="Final preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Order Details */}
            <div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Personalized Postcard
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Size</p>
                  <p className="text-lg font-semibold text-gray-900">
                    4x6 inches
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">1</p>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-2xl font-bold text-emerald-700">$3.50</p>
                </div>

                <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">Ready for printing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-12">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleProceedToPayment}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white text-center py-4 text-sm">
        <p>© 2025 Posta. All rights reserved.</p>
      </footer>
    </div>
  );
}
