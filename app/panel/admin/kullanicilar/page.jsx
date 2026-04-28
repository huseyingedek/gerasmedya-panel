"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

export default function AdminKullanicilar() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.getUsers().then((d) => setUsers(d.users)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setRole = async (u, role) => {
    setSaving(u.id);
    await adminApi.updateUser(u.id, { role }).catch(() => {});
    setSaving(null);
    load();
  };

  const setActive = async (u, isActive) => {
    setSaving(u.id);
    await adminApi.updateUser(u.id, { isActive }).catch(() => {});
    setSaving(null);
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Kullanıcılar</h1>
        <p className="text-gray-600 text-sm">{users.length} kayıtlı kullanıcı</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: u.role === "admin" ? "linear-gradient(135deg,#C9A84C,#A8893D)" : "rgba(255,255,255,0.08)" }}>
                {u.name?.[0]?.toUpperCase()}
              </div>
              {/* Bilgiler */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{u.name}</p>
                  {u.role === "admin" && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(201,168,76,0.15)", color: "#D4B86A" }}>Admin</span>
                  )}
                  {!u.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Pasif</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">{u.email}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-700">{u.plan}</span>
                  {u.planExpiry && (
                    <span className="text-xs text-gray-700">
                      {new Date(u.planExpiry) < new Date() ? "⚠ Süresi dolmuş" : `→ ${new Date(u.planExpiry).toLocaleDateString("tr-TR")}`}
                    </span>
                  )}
                  <span className="text-xs text-gray-700">{new Date(u.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
              {/* Aksiyonlar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {saving === u.id ? (
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
                ) : (
                  <>
                    <button onClick={() => setRole(u, u.role === "admin" ? "user" : "admin")}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all hover:text-white"
                      style={{ border: "1px solid rgba(255,255,255,0.08)", color: u.role === "admin" ? "#C9A84C" : "#6b7280" }}>
                      {u.role === "admin" ? "Admin ✓" : "Admin yap"}
                    </button>
                    <button onClick={() => setActive(u, !u.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${u.isActive ? "text-green-400 hover:text-red-400" : "text-red-400 hover:text-green-400"}`}
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      {u.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
