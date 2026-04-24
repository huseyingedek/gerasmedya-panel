"use client";
import { useAuth } from "@/lib/auth";
export default function HesabimPage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-10"><p className="text-gray-500 text-sm mb-1">Ayarlar</p><h1 className="text-3xl font-black">Hesabım</h1></div>
      <div className="card p-8 mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Profil Bilgileri</h2>
        <div className="space-y-5">
          <div><label className="block text-xs text-gray-600 mb-1.5">Ad Soyad</label><div className="input-field opacity-60 cursor-not-allowed">{user?.name || "—"}</div></div>
          <div><label className="block text-xs text-gray-600 mb-1.5">E-posta</label><div className="input-field opacity-60 cursor-not-allowed">{user?.email || "—"}</div></div>
        </div>
      </div>
      <div className="card p-8 mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Üyelik</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.3)"}}>⭐</div>
          <div><p className="font-bold">{user?.plan || "Standart Plan"}</p><p className="text-sm text-gray-500">Aktif üyelik</p></div>
        </div>
      </div>
      <button onClick={logout} className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all font-semibold text-sm">Çıkış Yap</button>
    </div>
  );
}
