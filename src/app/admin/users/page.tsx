"use client";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import type { AdminUser } from "@/types";
import { Loader2, Search, Shield, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const { users, loading, error, hasMore, loadUsers, loadMore, searchUsers, setAdminRole, resetUsers } =
    useAdminUsers();
  const [searchEmail, setSearchEmail] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers({ limit: 50 });
    return () => {
      resetUsers();
    };
  }, [loadUsers, resetUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchEmail);
  };

  const handleSetAdminRole = async (user: AdminUser, isAdmin: boolean) => {
    setUpdatingUserId(user.uid);
    try {
      const result = await setAdminRole(user.uid, isAdmin);
      if (result.success) {
        // Success - state is already updated by hook
      } else {
        alert(result.error || "Failed to update admin role");
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">จัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="ค้นหาด้วยอีเมล..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ค้นหา
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchEmail("");
              loadUsers({ limit: 50 });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            รีเซ็ต
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-gray-500">กำลังโหลด...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500">ไม่พบผู้ใช้</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <img className="h-10 w-10 rounded-full" src={user.photoURL} alt={user.displayName || ""} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.displayName?.[0] || user.email?.[0] || "U"}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName || "No name"}</div>
                          <div className="text-sm text-gray-500">{user.uid.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.emailVerified ? "Verified" : "Not verified"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="mr-1" size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("th-TH")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {updatingUserId === user.uid ? (
                        <Loader2 className="animate-spin text-gray-400" size={16} />
                      ) : user.isAdmin ? (
                        <button
                          onClick={() => handleSetAdminRole(user, false)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <ShieldOff size={16} />
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetAdminRole(user, true)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Shield size={16} />
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>กำลังโหลด...</span>
                </>
              ) : (
                <span>โหลดเพิ่มเติม</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

