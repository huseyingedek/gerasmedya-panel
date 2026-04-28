"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const userNav = [
  { href: "/panel/egitim",    icon: "🎓", label: "Eğitimler" },
  { href: "/panel/ipuclari",  icon: "💡", label: "İpuçları" },
  { href: "/panel/sablonlar", icon: "📋", label: "Şablonlar" },
  { href: "/panel/hesabim",   icon: "👤", label: "Hesabım" },
];

const adminNav = [
  { href: "/panel/admin/kurslar",          icon: "🗂️", label: "Kurslar" },
  { href: "/panel/admin/videolar",         icon: "🎬", label: "Videolar" },
  { href: "/panel/admin/yazilar",          icon: "📄", label: "Yazılar" },
  { href: "/panel/admin/ipuclari",         icon: "💡", label: "İpuçları" },
  { href: "/panel/admin/sablonlar",        icon: "📋", label: "Şablonlar" },
  { href: "/panel/admin/reklam-metinleri", icon: "✍️", label: "Reklam Metinleri" },
  { href: "/panel/admin/kullanicilar",     icon: "👥", label: "Kullanıcılar" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin   = user?.role === "admin";
  const planLabel = user?.plan === "YILLIK" ? "Yıllık Plan" : user?.role === "admin" ? "Admin" : "Aylık Plan";

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
        <SidebarContent pathname={pathname} user={user} planLabel={planLabel} isAdmin={isAdmin} logout={logout} />
      </aside>

      {/* Mobile slide-in */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/[0.06] bg-[#0d0d0d] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <Logo />
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            ✕
          </button>
        </div>
        <SidebarContent pathname={pathname} user={user} planLabel={planLabel} isAdmin={isAdmin} logout={logout} onClose={onClose} />
      </aside>
    </>
  );
}

function Logo() {
  return (
    <Link href="/panel/egitim" className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
        style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}>G</div>
      <span className="font-bold text-white text-sm">geras<span style={{ color: "#D4B86A" }}>panel</span></span>
    </Link>
  );
}

function NavItem({ href, icon, label, active, onClose }) {
  return (
    <Link href={href} onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "text-white"
          : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
      }`}
      style={active ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" } : {}}
    >
      <span className="text-base w-5 text-center">{icon}</span>
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#D4B86A" }} />}
    </Link>
  );
}

function SidebarContent({ pathname, user, planLabel, isAdmin, logout, onClose }) {
  return (
    <>
      {/* Logo — desktop only */}
      <div className="hidden md:flex p-6 border-b border-white/[0.06] items-center">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Kullanıcı Menüsü */}
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest px-4 mb-2 mt-1">Menü</p>
        {userNav.map((item) => (
          <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} onClose={onClose} />
        ))}

        {/* Admin Menüsü */}
        {isAdmin && (
          <>
            <div className="border-t border-white/[0.06] my-4" />
            <p className="text-xs font-semibold uppercase tracking-widest px-4 mb-2" style={{ color: "#C9A84C" }}>
              Admin Paneli
            </p>
            {adminNav.map((item) => (
              <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} onClose={onClose} />
            ))}
          </>
        )}

        <div className="border-t border-white/[0.06] my-4" />
        <a href="https://gerasmedya.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200">
          <span className="text-base w-5 text-center">🌐</span>
          gerasmedya.com
        </a>
      </nav>

      {/* User area */}
      <div className="p-4 border-t border-white/[0.06]">
        {user && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: isAdmin ? "linear-gradient(135deg,#C9A84C,#A8893D)" : "rgba(255,255,255,0.1)" }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs" style={{ color: isAdmin ? "#D4B86A" : "#6b7280" }}>{planLabel}</p>
              </div>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200">
          <span className="text-base w-5 text-center">⎋</span>
          Çıkış Yap
        </button>
      </div>
    </>
  );
}
