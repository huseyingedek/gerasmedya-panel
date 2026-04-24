"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/panel/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/panel/strateji", icon: "🔱", label: "Stratejiler" },
  { href: "/panel/hesabim", icon: "👤", label: "Hesabım" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const planLabel = user?.plan === "YILLIK" ? "Yıllık Plan" : "Aylık Plan";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col border-r border-white/[0.06] bg-[#0d0d0d]">
        <SidebarContent pathname={pathname} user={user} planLabel={planLabel} logout={logout} />
      </aside>

      {/* Mobile sidebar — slide in from left */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/[0.06] bg-[#0d0d0d] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <Link href="/panel/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}
            >
              G
            </div>
            <span className="font-bold text-white text-sm">
              geras<span style={{ color: "#D4B86A" }}>panel</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>
        <SidebarContent pathname={pathname} user={user} planLabel={planLabel} logout={logout} onClose={onClose} />
      </aside>
    </>
  );
}

function SidebarContent({ pathname, user, planLabel, logout, onClose }) {
  return (
    <>
      {/* Logo — desktop only */}
      <div className="hidden md:flex p-6 border-b border-white/[0.06] items-center gap-2.5">
        <Link href="/panel/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}
          >
            G
          </div>
          <span className="font-bold text-white text-sm">
            geras<span style={{ color: "#D4B86A" }}>panel</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest px-4 mb-3 mt-2">
          Menü
        </p>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-4" />

        <a
          href="https://gerasmedya.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
        >
          <span className="text-base w-5 text-center">🌐</span>
          gerasmedya.com
        </a>
      </nav>

      {/* User area */}
      <div className="p-4 border-t border-white/[0.06]">
        {user && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-600">{planLabel}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <span className="text-base w-5 text-center">⎋</span>
          Çıkış Yap
        </button>
      </div>
    </>
  );
}
