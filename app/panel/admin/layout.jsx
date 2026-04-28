"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else if (user.role !== "admin") router.replace("/panel/egitim");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return <>{children}</>;
}
