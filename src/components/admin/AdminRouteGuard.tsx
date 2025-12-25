"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Route Guard Component
 * Component สำหรับป้องกัน admin routes ให้เฉพาะ admin เท่านั้น
 * ใช้ใน admin layout หรือ pages ที่ต้องการ admin access
 */
export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

