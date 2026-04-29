"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); router.push("/panel/egitim"); }
    catch (err) { setError(err.message || "Giriş başarısız. E-posta veya şifrenizi kontrol edin."); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-black mb-1">Hoş geldiniz</h1>
      <p className="text-gray-500 text-sm mb-8">Panele erişmek için giriş yapın</p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">E-posta</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required className="input-field" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Şifre</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-field" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-white font-bold text-base mt-2 disabled:opacity-60">
          {loading ? "Giriş yapılıyor…" : "Giriş Yap →"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
        <p className="text-gray-600 text-sm">Henüz üye değil misiniz?</p>
        <a
          href="https://medya.gerasonline.com/iletisim"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors"
        >
          medya.gerasonline.com üzerinden üyelik alın →
        </a>
      </div>
    </div>
  );
}
