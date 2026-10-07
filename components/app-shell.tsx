"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2, BookOpen, CalendarCheck, GraduationCap, LayoutDashboard,
  MessageSquare, Trophy, Settings, Users, FileText, ChevronRight,
  Bell, Zap, Shield, LogOut, Menu, X
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Role } from "@/types/domain";
import { roleNav } from "@/lib/data";

const iconMap: Record<string, ReactNode> = {
  "Dashboard": <LayoutDashboard size={16} />,
  "Attendance": <CalendarCheck size={16} />,
  "Tests": <FileText size={16} />,
  "Assignments": <BookOpen size={16} />,
  "Library": <BookOpen size={16} />,
  "Chat": <MessageSquare size={16} />,
  "Leaderboard": <Trophy size={16} />,
  "Classes": <BarChart2 size={16} />,
  "Reports": <BarChart2 size={16} />,
  "Users": <Users size={16} />,
  "Settings": <Settings size={16} />,
};

const roleColors: Record<Role, { primary: string; glow: string; badge: string }> = {
  student: { primary: "#00ffe0", glow: "rgba(0,255,200,0.2)", badge: "badge-cyan" },
  faculty: { primary: "#ff0aff", glow: "rgba(255,10,255,0.2)", badge: "badge-pink" },
  admin: { primary: "#ffec00", glow: "rgba(255,236,0,0.2)", badge: "badge-yellow" },
};

const roleLabel: Record<Role, string> = {
  student: "STUDENT ZONE",
  faculty: "FACULTY HUB",
  admin: "ADMIN OPS",
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { primary, glow } = roleColors[role];

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="logo-ring animate-float" style={{ boxShadow: `0 0 24px ${glow}`, borderColor: `${primary}50` }}>
          <GraduationCap size={22} style={{ color: primary }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>Kings EC</p>
          <p className="text-xs text-muted-foreground" style={{ color: "rgba(180,210,255,0.4)", fontSize: "10px" }}>Smart Campus OS</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-2 mb-6">
        <div
          className="flex items-center gap-2 rounded-xl p-3"
          style={{ background: `linear-gradient(135deg, ${glow.replace('0.2', '0.06')} 0%, transparent 100%)`, border: `1px solid ${primary}25` }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: primary, boxShadow: `0 0 8px ${primary}` }} />
          <span className="text-xs font-bold tracking-widest" style={{ color: primary }}>{roleLabel[role]}</span>
        </div>
      </div>

      {/* Nav section label */}
      <p className="section-label mb-2">Navigation</p>
      <nav className="space-y-0.5">
        {roleNav[role].map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`nav-link ${isActive ? "active" : ""}`}
              style={isActive ? { color: primary } : {}}
            >
              <span style={isActive ? { color: primary } : { color: "rgba(120,160,200,0.5)" }}>
                {iconMap[item.label] ?? <ChevronRight size={14} />}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto" style={{ color: primary, opacity: 0.6 }}>
                  <ChevronRight size={12} />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="chaos-divider mt-6 mb-4" />

      {/* Security status */}
      <div
        className="mx-2 rounded-xl p-4"
        style={{
          background: "rgba(0,255,200,0.03)",
          border: "1px solid rgba(0,255,200,0.08)"
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} style={{ color: "#00ffe0" }} />
          <span className="text-xs font-bold" style={{ color: "#00ffe0" }}>RLS PROTECTED</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
        </div>
        <p className="text-xs leading-5" style={{ color: "rgba(120,160,200,0.5)", fontSize: "10px" }}>
          Supabase Auth · RLS · Audit Logs · QR verified
        </p>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto pt-6 space-y-1">
        <button className="nav-link w-full" style={{ color: "rgba(255,68,58,0.7)" }}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen">
      <div className="chaos-bg" />
      <div className="chaos-grid" />

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="sidebar hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen p-4">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
            <aside
              className="sidebar absolute left-0 top-0 bottom-0 w-72 p-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "slide-in-left 0.25s ease" }}
            >
              <button className="absolute top-4 right-4 text-muted-foreground" onClick={() => setMobileOpen(false)}>
                <X size={20} style={{ color: "rgba(180,210,255,0.5)" }} />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="chaos-header sticky top-0 z-40 h-16 flex items-center justify-between px-5 gap-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden btn-chaos btn-secondary p-2"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(120,160,200,0.5)" }}>
                  {roleLabel[role]}
                </p>
                <h1 className="text-sm font-bold" style={{ color: "rgba(200,230,255,0.9)" }}>
                  Kings Engineering College · Smart Campus
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(0,255,200,0.06)", border: "1px solid rgba(0,255,200,0.12)" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "#00ffe0", boxShadow: "0 0 6px #00ffe0" }} />
                <span className="text-xs font-bold" style={{ color: "#00ffe0", letterSpacing: "0.1em" }}>LIVE</span>
              </div>

              {/* Notifications */}
              <button
                id="header-notifications-btn"
                className="btn-chaos btn-secondary relative"
                style={{ width: 40, height: 40, padding: 0, justifyContent: "center" }}
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "#ff0aff", color: "#000", fontSize: "9px", boxShadow: "0 0 8px rgba(255,10,255,0.6)" }}
                >
                  3
                </span>
              </button>

              {/* AI Quick */}
              <button
                id="header-ai-btn"
                className="btn-chaos btn-primary hidden sm:inline-flex"
              >
                <Zap size={14} />
                Ask AI
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
