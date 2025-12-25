"use client";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Cog, Loader2, Lock, LogIn, Mail, MapPin, Package, Plane, Route, Ship, Truck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const LoginPage = () => {
  const { signIn, signInWithGoogle, loading, error, isAuthenticated } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.push("/");
      } else {
        setLocalError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (err) {
      setLocalError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        router.push("/");
      } else if (result.error) {
        // Only show error if there's an actual error (not user cancellation)
        setLocalError(result.error);
      }
      // If no error and no success, user likely closed the popup - don't show error
    } catch (err) {
      // Only show error for actual errors, not popup closure
      const error = err as { code?: string };
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setLocalError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen min-h-[100dvh] relative flex items-center justify-center p-3 sm:p-4 safe-area-inset">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img src="/img/driver-app-bg.png" alt="Logistics Background" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-2 sm:px-4">
        <div
          className="rounded-2xl shadow-2xl border-2 border-white/60 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6 bg-white/5 backdrop-blur-sm"
          style={{ boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)" }}
        >
          {/* Header with Logistics Illustration */}
          <div className="text-center space-y-3 sm:space-y-4">
            {/* Logistics Icons Illustration */}
            <div className="relative flex justify-center items-center mb-2 sm:mb-4">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#004d39] to-[#006b52] rounded-full flex items-center justify-center shadow-lg">
                  <Truck
                    className="text-white"
                    size={36}
                    strokeWidth={2}
                    style={{ width: "clamp(28px, 8vw, 48px)", height: "clamp(28px, 8vw, 48px)" }}
                  />
                </div>
                {/* Package Icon with Animation */}
                <div
                  className="absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2 bg-[#38B04A] p-1.5 sm:p-2 rounded-full shadow-md animate-bounce"
                  style={{ animationDuration: "2s" }}
                >
                  <Package className="text-white" size={12} style={{ width: "clamp(12px, 3vw, 16px)", height: "clamp(12px, 3vw, 16px)" }} />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-1 sm:mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                เข้าสู่ระบบ
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-white/95 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                ยินดีต้อนรับสู่ LogiTrack Driver
              </p>
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="border-l-4 border-red-400 p-3 sm:p-4 rounded-xl border-2 border-red-400/60 bg-red-500/10 backdrop-blur-sm">
              <p className="text-xs sm:text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{displayError}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-bold text-white drop-shadow-md block">
                อีเมล
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/90 drop-shadow-sm"
                  size={18}
                  style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="กรุณากรอกอีเมล"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-white/60 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white disabled:cursor-not-allowed disabled:border-white/30 bg-white/10 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="text-xs sm:text-sm font-bold text-white drop-shadow-md block">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/90 drop-shadow-sm"
                  size={18}
                  style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-white/60 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white disabled:cursor-not-allowed disabled:border-white/30 bg-white/10 backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white/20 backdrop-blur-sm border-2 border-white/70 text-white py-2.5 sm:py-3 rounded-xl font-bold hover:bg-white/30 hover:border-white transition-all disabled:cursor-not-allowed disabled:border-white/30 disabled:bg-white/5 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
              style={{ boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2 sm:py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-transparent text-white/90 drop-shadow-md text-xs sm:text-sm">หรือ</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }} />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  style={{ width: "clamp(16px, 4vw, 20px)", height: "clamp(16px, 4vw, 20px)" }}
                >
                  <title>Google Logo</title>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
