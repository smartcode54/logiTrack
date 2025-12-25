"use client";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/config";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CheckAdminResponse {
  isAdmin: boolean;
}

export const AdminLoginPage = () => {
  const { signIn, signInWithGoogle, logout, loading: authLoading, isAuthenticated, user } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const router = useRouter();

  // Check admin status only if already authenticated
  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      if (!isAuthenticated || !user || authLoading) {
        return;
      }

      try {
        setCheckingAdmin(true);
        const checkAdmin = httpsCallable<unknown, CheckAdminResponse>(functions, "check_admin");
        const result = await checkAdmin();
        
        if (result.data.isAdmin) {
          router.push("/admin");
        }
      } catch (error) {
        // Silently fail - user can still login
        console.error("Error checking admin status:", error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAndRedirect();
  }, [isAuthenticated, user, authLoading, router]);

  const loading = authLoading || checkingAdmin;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        // Check admin status after login
        try {
          const checkAdmin = httpsCallable<unknown, CheckAdminResponse>(functions, "check_admin");
          const adminResult = await checkAdmin();
          
          if (adminResult.data.isAdmin) {
            router.push("/admin");
          } else {
            setLocalError("คุณไม่มีสิทธิ์เข้าถึง Admin Portal");
            await logout();
          }
        } catch (error) {
          // If check fails, still allow login attempt
          console.error("Error checking admin status:", error);
          setLocalError("ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองใหม่อีกครั้ง");
        }
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
        // Check admin status after login
        try {
          const checkAdmin = httpsCallable<unknown, CheckAdminResponse>(functions, "check_admin");
          const adminResult = await checkAdmin();
          
          if (adminResult.data.isAdmin) {
            router.push("/admin");
          } else {
            setLocalError("คุณไม่มีสิทธิ์เข้าถึง Admin Portal");
            await logout();
          }
        } catch (error) {
          // If check fails, still allow login attempt
          console.error("Error checking admin status:", error);
          setLocalError("ไม่สามารถตรวจสอบสิทธิ์ได้ กรุณาลองใหม่อีกครั้ง");
        }
      } else if (result.error) {
        setLocalError(result.error);
      }
    } catch (err) {
      const error = err as { code?: string };
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setLocalError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white font-medium">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // Don't render if checking admin (will redirect if admin)
  if (checkingAdmin && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                <Shield className="text-white" size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
              <p className="text-white/80 text-sm">เข้าสู่ระบบเพื่อจัดการระบบ LogiTrack</p>
            </div>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="border-l-4 border-red-400 p-4 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-400/20">
              <p className="text-sm font-medium text-red-200">{localError}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/90 block">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="กรุณากรอกอีเมล"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:border-white/10 bg-white/5 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white/90 block">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:border-white/10 bg-white/5 backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-transparent text-white/60 text-sm">หรือ</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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

export default AdminLoginPage;

