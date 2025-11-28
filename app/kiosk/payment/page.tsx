"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign } from "lucide-react";
import { ProgressSteps } from "@/components/global/progress-steps";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session") || "";
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      console.log("[v0] Payment processed for session:", sessionId);
      router.push(`/kiosk/print?session=${sessionId}`);
    }, 2000);
  };

  const handleBack = () => {
    router.push(`/kiosk/review?session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Steps */}
      <ProgressSteps currentStep={5} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Payment
          </h2>

          {/* Amount */}
          <div className="bg-emerald-50 rounded-lg p-6 mb-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-8 h-8 text-emerald-700" />
              <p className="text-4xl font-bold text-emerald-700">3.50</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4 mb-8">
            <label className="flex items-center p-4 border-2 border-emerald-700 rounded-lg cursor-pointer bg-emerald-50">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value as "card")}
                className="w-4 h-4 text-emerald-700"
              />
              <CreditCard className="w-5 h-5 ml-3 text-emerald-700" />
              <span className="ml-3 font-medium text-gray-900">
                Card Payment
              </span>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value as "cash")}
                className="w-4 h-4 text-gray-700"
              />
              <DollarSign className="w-5 h-5 ml-3 text-gray-700" />
              <span className="ml-3 font-medium text-gray-900">
                Cash Payment
              </span>
            </label>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              {paymentMethod === "card"
                ? "Your payment will be processed securely."
                : "Please have exact cash ready. Ask a staff member for assistance."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
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
