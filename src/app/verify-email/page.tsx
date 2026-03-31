"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("Verifying your email...");
  const [success, setSuccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("Invalid or missing verification token.");
      setSuccess(false);
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus("Your email has been verified successfully!");
        setSuccess(true);
      })
      .catch(() => {
        setStatus("Verification failed or token expired.");
        setSuccess(false);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {success === true && <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />}
        {success === false && <XCircle className="mx-auto text-red-500 w-16 h-16 mb-4" />}
        <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        {success && (
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Go to Login
          </button>
        )}
        {success === false && (
          <button
            onClick={() => router.push("/resend-verification")}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Resend Verification Email
          </button>
        )}
      </div>
    </div>
  );
}