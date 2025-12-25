"use client";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { BarChart3, Users, Workflow } from "lucide-react";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { userStats, loadUserStats, loading } = useAdminUsers();

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">ภาพรวมระบบ LogiTrack</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : userStats?.totalUsers || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : userStats?.totalAdmins || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Regular Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : userStats?.totalRegularUsers || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Workflow className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Users</span>
            <span className="font-semibold text-gray-900">{loading ? "..." : userStats?.totalUsers || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Admin Users</span>
            <span className="font-semibold text-gray-900">{loading ? "..." : userStats?.totalAdmins || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Regular Users</span>
            <span className="font-semibold text-gray-900">{loading ? "..." : userStats?.totalRegularUsers || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

